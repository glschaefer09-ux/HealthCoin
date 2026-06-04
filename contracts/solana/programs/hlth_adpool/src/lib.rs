use anchor_lang::prelude::*;
use anchor_spl::token_interface::{Mint, TokenAccount, TokenInterface};

declare_id!("Wp3v1pUaMHcA5qruFBuhvDpuVSEn2TeVLkxrdibyhgb");

/// Ad slot categories — mirrors HealthCoin's healthcare verticals
#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum AdCategory {
    PrimaryCare,
    Dental,
    MentalHealth,
    Pharmacy,
    Fitness,
    Telehealth,
}

/// Duration options for ad slots (in days)
const SLOT_DURATION_7: i64  = 7  * 86_400;
const SLOT_DURATION_30: i64 = 30 * 86_400;

#[program]
pub mod hlth_adpool {
    use super::*;

    pub fn initialize_treasury(ctx: Context<InitializeTreasury>) -> Result<()> {
        let treasury = &mut ctx.accounts.treasury;
        treasury.authority = ctx.accounts.authority.key();
        treasury.mint = ctx.accounts.mint.key();
        treasury.total_collected = 0;
        treasury.bump = ctx.bumps.treasury;
        Ok(())
    }

    pub fn buy_ad_slot(
        ctx: Context<BuyAdSlot>,
        category: AdCategory,
        duration_days: u8,
        title: String,
        description: String,
        cta_url: String,
    ) -> Result<()> {
        require!(title.len() <= 80, AdPoolError::TitleTooLong);
        require!(description.len() <= 280, AdPoolError::DescTooLong);
        require!(cta_url.len() <= 200, AdPoolError::UrlTooLong);
        require!(duration_days == 7 || duration_days == 30, AdPoolError::InvalidDuration);

        let price = slot_price(duration_days);
        let clock = Clock::get()?;

        let slot = &mut ctx.accounts.ad_slot;
        slot.provider = ctx.accounts.provider.key();
        slot.category = category;
        slot.title = title;
        slot.description = description;
        slot.cta_url = cta_url;
        slot.starts_at = clock.unix_timestamp;
        slot.expires_at = clock.unix_timestamp
            + if duration_days == 7 { SLOT_DURATION_7 } else { SLOT_DURATION_30 };
        slot.active = true;

        // Transfer HLTH from provider to treasury
        anchor_spl::token_interface::transfer_checked(
            CpiContext::new(
                ctx.accounts.token_program.to_account_info(),
                anchor_spl::token_interface::TransferChecked {
                    from: ctx.accounts.provider_token_account.to_account_info(),
                    mint: ctx.accounts.mint.to_account_info(),
                    to: ctx.accounts.treasury_vault.to_account_info(),
                    authority: ctx.accounts.provider.to_account_info(),
                },
            ),
            price,
            9,
        )?;

        ctx.accounts.treasury.total_collected += price;
        Ok(())
    }

    pub fn deactivate_expired_slot(ctx: Context<DeactivateSlot>) -> Result<()> {
        let slot = &mut ctx.accounts.ad_slot;
        let clock = Clock::get()?;
        require!(clock.unix_timestamp >= slot.expires_at, AdPoolError::SlotNotExpired);
        slot.active = false;
        Ok(())
    }
}

/// Base price: 100 HLTH for 7 days, 350 HLTH for 30 days
fn slot_price(duration_days: u8) -> u64 {
    let base: u64 = if duration_days == 7 { 100 } else { 350 };
    base * 1_000_000_000 // 9 decimals
}

// ── Accounts ──────────────────────────────────────────────────────────────────

#[derive(Accounts)]
pub struct InitializeTreasury<'info> {
    #[account(mut)]
    pub authority: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(
        init,
        payer = authority,
        space = 8 + Treasury::SPACE,
        seeds = [b"treasury"],
        bump
    )]
    pub treasury: Account<'info, Treasury>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct BuyAdSlot<'info> {
    #[account(mut)]
    pub provider: Signer<'info>,
    pub mint: InterfaceAccount<'info, Mint>,
    #[account(mut, seeds = [b"treasury"], bump = treasury.bump)]
    pub treasury: Account<'info, Treasury>,
    #[account(
        init,
        payer = provider,
        space = 8 + AdSlot::SPACE,
        seeds = [b"slot", provider.key().as_ref(), &[Clock::get().unwrap().unix_timestamp as u8]],
        bump
    )]
    pub ad_slot: Account<'info, AdSlot>,
    #[account(mut)]
    pub provider_token_account: InterfaceAccount<'info, TokenAccount>,
    #[account(mut)]
    pub treasury_vault: InterfaceAccount<'info, TokenAccount>,
    pub token_program: Interface<'info, TokenInterface>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct DeactivateSlot<'info> {
    #[account(mut)]
    pub ad_slot: Account<'info, AdSlot>,
}

// ── State ─────────────────────────────────────────────────────────────────────

#[account]
pub struct Treasury {
    pub authority: Pubkey,
    pub mint: Pubkey,
    pub total_collected: u64,
    pub bump: u8,
}

impl Treasury {
    const SPACE: usize = 32 + 32 + 8 + 1;
}

#[account]
pub struct AdSlot {
    pub provider: Pubkey,
    pub category: AdCategory,
    pub title: String,       // max 80
    pub description: String, // max 280
    pub cta_url: String,     // max 200
    pub starts_at: i64,
    pub expires_at: i64,
    pub active: bool,
}

impl AdSlot {
    // 32 + 1 + (4+80) + (4+280) + (4+200) + 8 + 8 + 1
    const SPACE: usize = 32 + 1 + 84 + 284 + 204 + 8 + 8 + 1;
}

// ── Errors ────────────────────────────────────────────────────────────────────

#[error_code]
pub enum AdPoolError {
    #[msg("Title must be 80 characters or fewer")]
    TitleTooLong,
    #[msg("Description must be 280 characters or fewer")]
    DescTooLong,
    #[msg("CTA URL must be 200 characters or fewer")]
    UrlTooLong,
    #[msg("Duration must be 7 or 30 days")]
    InvalidDuration,
    #[msg("Slot has not expired yet")]
    SlotNotExpired,
}
