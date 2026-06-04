use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("51UJHRoMY2EjBeViQyZb5BXpMuuuQdADmXJwaAqXKLpg");

/// HLTH awarded per activity type (raw units, 9 decimals)
const REWARD_CHECKUP:          u64 = 50  * 1_000_000_000;
const REWARD_PRESCRIPTION:     u64 = 25  * 1_000_000_000;
const REWARD_JOURNAL_STREAK:   u64 = 100 * 1_000_000_000; // 30-day streak
const REWARD_REFERRAL:         u64 = 75  * 1_000_000_000;

/// Verified providers may call attest_activity; oracle authority may also call
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ActivityType {
    Checkup,
    Prescription,
    JournalStreak30,
    Referral,
}

#[program]
pub mod hlth_rewards {
    use super::*;

    pub fn initialize_rewards_pool(ctx: Context<InitializeRewardsPool>) -> Result<()> {
        let pool = &mut ctx.accounts.rewards_pool;
        pool.authority = ctx.accounts.authority.key();
        pool.mint = ctx.accounts.mint.key();
        pool.total_distributed = 0;
        pool.bump = ctx.bumps.rewards_pool;
        Ok(())
    }

    /// Called by a verified provider or oracle to attest a patient completed an activity.
    /// Emits HLTH from the rewards pool to the patient's wallet.
    pub fn attest_activity(
        ctx: Context<AttestActivity>,
        activity_type: ActivityType,
    ) -> Result<()> {
        // Prevent double-rewarding the same activity in the same epoch
        let record = &mut ctx.accounts.activity_record;
        require!(!record.claimed, RewardsError::AlreadyClaimed);

        record.patient = ctx.accounts.patient.key();
        record.attester = ctx.accounts.attester.key();
        record.activity_type = activity_type.clone();
        record.claimed = true;
        record.timestamp = Clock::get()?.unix_timestamp;

        let reward_amount = match activity_type {
            ActivityType::Checkup        => REWARD_CHECKUP,
            ActivityType::Prescription   => REWARD_PRESCRIPTION,
            ActivityType::JournalStreak30 => REWARD_JOURNAL_STREAK,
            ActivityType::Referral       => REWARD_REFERRAL,
        };

        let pool = &mut ctx.accounts.rewards_pool;
        pool.total_distributed += reward_amount;

        let pool_bump = pool.bump;
        let seeds = &[b"rewards_pool", pool.mint.as_ref(), &[pool_bump]];
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.rewards_vault.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.patient_token_account.to_account_info(),
                    authority: pool.to_account_info(),
                },
                &[seeds],
            ),
            reward_amount,
            9,
        )?;

        emit!(ActivityAttested {
            patient: ctx.accounts.patient.key(),
            attester: ctx.accounts.attester.key(),
            activity_type: record.activity_type.clone(),
            reward_amount,
            timestamp: record.timestamp,
        });

        Ok(())
    }
}

// ── Accounts ──────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeRewardsPool<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + RewardsPool::SPACE,
        seeds = [b"rewards_pool", mint.key().as_ref()],
        bump
    )]
    pub rewards_pool: Account<'info, RewardsPool>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(activity_type: ActivityType)]
pub struct AttestActivity<'info> {
    /// Verified provider or oracle authority
    #[account(mut)]
    pub attester: Signer<'info>,
    /// CHECK: patient wallet — just a recipient, not a signer
    pub patient: AccountInfo<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut, seeds = [b"rewards_pool", mint.key().as_ref()], bump = rewards_pool.bump)]
    pub rewards_pool: Account<'info, RewardsPool>,
    #[account(
        init,
        payer = attester,
        space = 8 + ActivityRecord::SPACE,
        // One record per patient+attester+activity combination prevents double-spend
        seeds = [b"activity", patient.key().as_ref(), attester.key().as_ref(), &[activity_type_discriminant(&activity_type)]],
        bump
    )]
    pub activity_record: Account<'info, ActivityRecord>,
    #[account(mut)]
    pub rewards_vault: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub patient_token_account: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

fn activity_type_discriminant(a: &ActivityType) -> u8 {
    match a {
        ActivityType::Checkup         => 0,
        ActivityType::Prescription    => 1,
        ActivityType::JournalStreak30 => 2,
        ActivityType::Referral        => 3,
    }
}

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct RewardsPool {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_distributed: u64,
    pub bump: u8,
}

impl RewardsPool {
    const SPACE: usize = 32 + 32 + 8 + 1;
}

#[account]
pub struct ActivityRecord {
    pub patient: Pubkey,
    pub attester: Pubkey,
    pub activity_type: ActivityType,
    pub claimed: bool,
    pub timestamp: i64,
}

impl ActivityRecord {
    const SPACE: usize = 32 + 32 + 1 + 1 + 8;
}

// ── Events ────────────────────────────────────────────────────────────────────

#[event]
pub struct ActivityAttested {
    pub patient: Pubkey,
    pub attester: Pubkey,
    pub activity_type: ActivityType,
    pub reward_amount: u64,
    pub timestamp: i64,
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum RewardsError {
    #[msg("This activity has already been rewarded for this patient")]
    AlreadyClaimed,
}
