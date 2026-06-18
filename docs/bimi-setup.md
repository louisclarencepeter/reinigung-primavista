# BIMI setup for Prima Vista

This repo hosts the BIMI logo at:

```text
https://reinigung-primavista.com/.well-known/bimi.svg
```

## Quick iPhone-only fix

Add `info@reinigung-primavista.com` as an iPhone contact and set the Prima Vista logo/photo on that contact. Apple Mail can show contact photos in the message list when "Show Contact Photos" is enabled. Apple documents the Mail setting here: https://support.apple.com/guide/iphone/check-your-email-iph461684497/ios

## Live BIMI setup

BIMI is the standards-based way to let supported inboxes show the Prima Vista brand logo next to authenticated email.

The logo used inside OutreachOS or inside an email template affects the message body, not the inbox avatar. BIMI is what controls the brand logo signal for supported inbox message lists.

Configured on 2026-06-18:

- `https://reinigung-primavista.com/.well-known/bimi.svg` returns the hosted BIMI logo over HTTPS.
- `_dmarc.reinigung-primavista.com` TXT: `v=DMARC1; p=quarantine; pct=100;`
- `default._bimi.reinigung-primavista.com` TXT: `v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=;`
- `resend._domainkey.reinigung-primavista.com` has a DKIM TXT record.
- `send.reinigung-primavista.com` has SPF/MX records for Amazon SES/Resend sending.

Before relying on this for production email, confirm that the actual sending provider for `info@reinigung-primavista.com` signs mail with DKIM aligned to `reinigung-primavista.com`.

The current DMARC policy is the least-aggressive BIMI-compatible enforcement mode:

```text
_dmarc.reinigung-primavista.com TXT "v=DMARC1; p=quarantine; pct=100"
```

Use `p=reject` instead of `p=quarantine` when the domain is ready for the stricter policy. Add a `rua=mailto:...` reporting address only after that mailbox or report processor exists.

After DMARC enforcement is in place, publish the BIMI record:

```text
default._bimi.reinigung-primavista.com TXT "v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=;"
```

The current record intentionally leaves `a=;` empty because no certificate file is hosted yet.

For providers that require a certificate, especially Gmail and Apple Mail, get a VMC or CMC certificate and host it over HTTPS. Then update the BIMI record from:

```text
default._bimi.reinigung-primavista.com TXT "v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=;"
```

to:

```text
default._bimi.reinigung-primavista.com TXT "v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=https://reinigung-primavista.com/.well-known/vmc.pem"
```

Important: a VMC/CMC is bound to the exact SVG logo. Do not replace `bimi.svg` after the certificate is issued unless the certificate is reissued for the new file.

References:

- BIMI Group sender FAQ: https://bimigroup.org/faqs-for-senders-esps/
- Google BIMI setup: https://knowledge.workspace.google.com/admin/security/set-up-bimi
