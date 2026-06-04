use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("6wCuTmT9HBBZAiHtsE3nksumQ9xR8gnE5AMUo24tWWM2");

/// Annual yield rate for patient stakers: 12%
const PATIENT_APY_BPS: u64 = 1200;
/// Minimum HLTH a provider must stake to receive verified badge
const PROVIDER_BADGE_MIN: u64 = 10_000 * 1_000_000_000; // 10,000 HLTH (9 decimals)
const SECONDS_PER_YEAR: u64 = 31_536_000;

#[program]
pub mod hlth_staking {
    use super::*;

    pub fn initialize_pool(ctx: Context<InitializePool>, pool_type: PoolType) -> Result<()> {
        let pool = &mut ctx.accounts.pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.pool_type = pool_type;
        pool.total_staked = 0;
        pool.bump = ctx.bumps.pool;
        Ok(())
    }

    pub fn stake(ctx: Context<Stake>, amount: u64) -> Result<()> {
        require!(amount > 0, StakingError::ZeroAmount);

        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;

        // Settle pending rewards before adding new stake
        settle_rewards(stake_account, clock.unix_timestamp)?;

        stake_account.owner = ctx.accounts.owner.key();
        stake_account.pool = ctx.accounts.pool.key();
        stake_account.amount += amount;
        stake_account.last_updated = clock.unix_timestamp;

        let pool = &mut ctx.accounts.pool;
        pool.total_staked += amount;

        // Transfer HLTH from user to pool vault
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.user_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.pool_vault.to_account_info(),
                    authority: ctx.accounts.owner.to_account_info(),
                },
            ),
            amount,
            9,
        )?;

        // Grant provider badge if threshold met and pool is provider type
        if pool.pool_type == PoolType::Provider && stake_account.amount >= PROVIDER_BADGE_MIN {
            stake_account.has_badge = true;
        }

        Ok(())
    }

    pub fn unstake(ctx: Context<Unstake>, amount: u64) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        require!(stake_account.amount >= amount, StakingError::InsufficientStake);

        let clock = Clock::get()?;
        settle_rewards(stake_account, clock.unix_timestamp)?;

        stake_account.amount -= amount;

        let pool = &mut ctx.accounts.pool;
        pool.total_staked -= amount;

        if pool.pool_type == PoolType::Provider && stake_account.amount < PROVIDER_BADGE_MIN {
            stake_account.has_badge = false;
        }

        let pool_bump = pool.bump;
        let seeds = &[b"pool", pool.mint.as_ref(), &[pool_bump]];
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.pool_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: pool.to_account_info(),
                },
                &[seeds],
            ),
            amount,
            9,
        )?;

        Ok(())
    }

    pub fn claim_rewards(ctx: Context<ClaimRewards>) -> Result<()> {
        let stake_account = &mut ctx.accounts.stake_account;
        let clock = Clock::get()?;
        settle_rewards(stake_account, clock.unix_timestamp)?;

        let rewards = stake_account.pending_rewards;
        require!(rewards > 0, StakingError::NoRewards);
        stake_account.pending_rewards = 0;

        let pool = &ctx.accounts.pool;
        let pool_bump = pool.bump;
        let seeds = &[b"pool", pool.mint.as_ref(), &[pool_bump]];
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.pool_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: pool.to_account_info(),
                },
                &[seeds],
            ),
            rewards,
            9,
        )?;

        Ok(())
    }
}

fn settle_rewards(stake_account: &mut StakeAccount, now: i64) -> Result<()> {
    if stake_account.amount == 0 || stake_account.last_updated == 0 {
        stake_account.last_updated = now;
        return Ok(());
    }
    let elapsed = (now - stake_account.last_updated).max(0) as u64;
    let reward = stake_account.amount
        .checked_mul(PATIENT_APY_BPS).unwrap()
        .checked_mul(elapsed).unwrap()
        / 10_000
        / SECONDS_PER_YEAR;
    stake_account.pending_rewards += reward;
    stake_account.last_updated = now;
    Ok(())
}

// ── Accounts ──────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializePool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + StakingPool::SPACE,
        seeds = [b"pool", mint.key().as_ref()],
        bump
    )]
    pub pool: Account<'info, StakingPool>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Stake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut, seeds = [b"pool", mint.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(
        init_if_needed,
        payer = owner,
        space = 8 + StakeAccount::SPACE,
        seeds = [b"stake", pool.key().as_ref(), owner.key().as_ref()],
        bump
    )]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub pool_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct Unstake<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut, seeds = [b"pool", mint.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"stake", pool.key().as_ref(), owner.key().as_ref()], bump)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub pool_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

#[derive(Accounts)]
pub struct ClaimRewards<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(seeds = [b"pool", mint.key().as_ref()], bump = pool.bump)]
    pub pool: Account<'info, StakingPool>,
    #[account(mut, seeds = [b"stake", pool.key().as_ref(), owner.key().as_ref()], bump)]
    pub stake_account: Account<'info, StakeAccount>,
    #[account(mut)]
    pub user_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub pool_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
}

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct StakingPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub pool_type: PoolType,
    pub total_staked: u64,
    pub bump: u8,
}

impl StakingPool {
    const SPACE: usize = 32 + 32 + 1 + 8 + 1;
}

#[account]
pub struct StakeAccount {
    pub owner: Pubkey,
    pub pool: Pubkey,
    pub amount: u64,
    pub pending_rewards: u64,
    pub last_updated: i64,
    pub has_badge: bool,
}

impl StakeAccount {
    const SPACE: usize = 32 + 32 + 8 + 8 + 8 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum PoolType {
    Patient,
    Provider,
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum StakingError {
    #[msg("Amount must be greater than zero")]
    ZeroAmount,
    #[msg("Insufficient staked balance")]
    InsufficientStake,
    #[msg("No rewards to claim")]
    NoRewards,
}
