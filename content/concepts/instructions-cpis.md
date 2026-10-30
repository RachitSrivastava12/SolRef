---
id: instructions-cpis
order: 12
title: Instructions & CPIs
tag: Programs
level: intermediate
icon: Code2
diagramKey: null
reviewStatus: pending-expert-review
lastReviewed: null
expertReviewer: null
temporalStatus: mixed
exampleStatus: needs-expert-verification
provenance: legacy-provenance-not-recorded
license: GPL-3.0-only
links:
  - label: Solana Docs — Cross-Program Invocation
    url: https://solana.com/docs/core/cpi
    sourceKind: primary
  - label: Anchor CPI Guide
    url: https://www.anchor-lang.com/docs/cross-program-invocations
    sourceKind: secondary
  - label: PDA Guide — Solana Cookbook
    url: https://solanacookbook.com/core-concepts/pdas.html
    sourceKind: secondary
  - label: Sysvar Reference
    url: https://solana.com/docs/core/accounts/account-types
    sourceKind: primary
aiAssisted: unknown
codeLanguage: rust
---

## Overview

Instructions are the atomic units of work on Solana. Each instruction specifies: the program to call, the accounts it needs (with read/write permissions), and a data payload. Cross-Program Invocations (CPIs) let programs call other programs — this is how composability works. PDAs let programs create accounts and sign for them without a private key.

## Key facts
- Current instruction stack limit: 5 program frames total, including the first program. That allows up to 4 nested CPIs.
- SIMD-0268 proposes increasing the limit to 9 frames (8 nested CPIs); it is not active on mainnet.
- A CPI inherits the account permissions its caller passes, but cannot make an account more writable or signed than it was.
- `invoke` calls another program with existing transaction signers; `invoke_signed` can add a PDA derived by the calling program.
- A callee uses the same transaction compute budget as the caller.
- Account ordering in instruction is critical
- Sysvar accounts: Clock, Rent, StakeHistory, etc.
- Program-to-program calls are synchronous (no async)
- Direct self-recursion is allowed; an indirect call back into a program (A → B → A) is rejected.

## Why it matters

CPIs let one program reuse another program's instructions. A token program can move tokens when called by a wallet or another program, for example. Keep nested calls within today's limit: a top-level instruction plus four nested CPIs. A fifth nested CPI exceeds the current stack limit.

## Common mistakes
- Exceeding the current limit of four nested CPIs — SIMD-0268's increase to eight has not activated
- Not passing the correct sysvar accounts in CPIs
- Forgetting that accounts must be writable if the callee modifies them
- Not understanding that CPI failures propagate up and revert the entire tx

## Example

```rust
// Anchor-based example. Replace the ID with your program's generated ID.

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Transfer};

// Replace this example ID with the ID generated for your program.
declare_id!("Fg6PaFpoGXkYsidMpWxTWqoz5gZ2U8oynVZze2f7kU");

#[program]
pub mod my_defi_program {
    use super::*;

    // ── BASIC CPI: Transfer SPL Tokens ────────────────────────────
    pub fn transfer_tokens(ctx: Context<TransferTokens>, amount: u64) -> Result<()> {
        // Build the CPI context
        let cpi_accounts = Transfer {
            from:      ctx.accounts.from_token_account.to_account_info(),
            to:        ctx.accounts.to_token_account.to_account_info(),
            authority: ctx.accounts.user.to_account_info(), // user must sign
        };
        let cpi_ctx = CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts
        );

        // Execute the CPI — this calls the SPL Token program
        token::transfer(cpi_ctx, amount)?;
        msg!("Transferred {} tokens", amount);
        Ok(())
    }

    // ── PDA-SIGNED CPI: Vault releases tokens ────────────────────
    // PDAs have no private key — programs sign for them via invoke_signed
    pub fn vault_withdraw(ctx: Context<VaultWithdraw>, amount: u64) -> Result<()> {
        let vault_bump = ctx.bumps.vault_authority;

        // Seeds that derive the PDA — must match exactly
        let user_key = ctx.accounts.user.key();
        let bump_seed = [vault_bump];
        let seeds: &[&[u8]] = &[
            b"vault-authority",
            user_key.as_ref(),
            &bump_seed,
        ];
        let signer_seeds: &[&[&[u8]]] = &[seeds];

        let cpi_accounts = Transfer {
            from:      ctx.accounts.vault_token_account.to_account_info(),
            to:        ctx.accounts.user_token_account.to_account_info(),
            authority: ctx.accounts.vault_authority.to_account_info(), // PDA signs!
        };

        // CpiContext::new_with_signer tells the runtime this PDA is signing
        let cpi_ctx = CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            cpi_accounts,
            signer_seeds // PDA signs with these seeds
        );

        token::transfer(cpi_ctx, amount)?;
        Ok(())
    }

}

// ── ACCOUNT STRUCT DEFINITIONS ────────────────────────────────────
#[derive(Accounts)]
pub struct TransferTokens<'info> {
    #[account(mut)]
    pub user: Signer<'info>,                        // must sign tx

    #[account(mut, constraint = from_token_account.owner == user.key())]
    pub from_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub to_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,       // SPL Token program
}

#[derive(Accounts)]
pub struct VaultWithdraw<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    /// CHECK: PDA derived from ["vault-authority", user.key]
    #[account(
        seeds = [b"vault-authority", user.key.as_ref()],
        bump,
    )]
    pub vault_authority: UncheckedAccount<'info>,

    #[account(mut, token::authority = vault_authority)]
    pub vault_token_account: Account<'info, TokenAccount>,

    #[account(mut, token::authority = user, token::mint = vault_token_account.mint)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
```

The example shows the CPI calls and the accounts they need. In a real program, add validation for the vault's rules and test the PDA seeds and token-account relationships before deployment.

## References
- [Solana Docs — Cross-Program Invocation](https://solana.com/docs/core/cpi)
- [Solana Upgrade — CPI nesting depth](https://solana.com/upgrades/cpi-nesting-depth)
- [CPI Documentation](https://solana.com/docs/core/cpi)
- [Anchor CPI Guide](https://www.anchor-lang.com/docs/cross-program-invocations)
- [PDA Guide — Solana Cookbook](https://solanacookbook.com/core-concepts/pdas.html)
- [Sysvar Reference](https://solana.com/docs/core/accounts/account-types)
