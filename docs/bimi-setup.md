# BIMI setup for Prima Vista

This repo hosts the BIMI logo at:

```text
https://reinigung-primavista.com/.well-known/bimi.svg
```

## Quick iPhone-only fix

Add `info@reinigung-primavista.com` as an iPhone contact and set the Prima Vista logo/photo on that contact. Apple Mail can show contact photos in the message list when "Show Contact Photos" is enabled. Apple documents the Mail setting here: https://support.apple.com/guide/iphone/check-your-email-iph461684497/ios

## Real fix for supported inboxes

BIMI is the standards-based way to let supported inboxes show the Prima Vista brand logo next to authenticated email.

The logo used inside OutreachOS or inside an email template affects the message body, not the inbox avatar. BIMI is what controls the brand logo signal for supported inbox message lists.

As of a DNS check on 2026-06-18, `reinigung-primavista.com` had:

- `_dmarc.reinigung-primavista.com`: `v=DMARC1; p=none;`
- no `default._bimi.reinigung-primavista.com` TXT record found
- no apex SPF TXT record found
- no MX record found

Before enabling BIMI, confirm the actual sending provider for `info@reinigung-primavista.com` and make sure SPF and/or DKIM pass and align with the visible From domain.

Then move DMARC to enforcement after monitoring:

```text
_dmarc.reinigung-primavista.com TXT "v=DMARC1; p=quarantine; pct=100"
```

Use `p=reject` instead of `p=quarantine` when the domain is ready for the stricter policy. Add a `rua=mailto:...` reporting address only after that mailbox or report processor exists.

After DMARC enforcement is in place, publish the BIMI record:

```text
default._bimi.reinigung-primavista.com TXT "v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=;"
```

For providers that require a certificate, especially Gmail and Apple Mail, get a VMC or CMC certificate and host it over HTTPS. Then update the BIMI record:

```text
default._bimi.reinigung-primavista.com TXT "v=BIMI1; l=https://reinigung-primavista.com/.well-known/bimi.svg; a=https://reinigung-primavista.com/.well-known/vmc.pem"
```

Important: a VMC/CMC is bound to the exact SVG logo. Do not replace `bimi.svg` after the certificate is issued unless the certificate is reissued for the new file.

References:

- BIMI Group sender FAQ: https://bimigroup.org/faqs-for-senders-esps/
- Google BIMI setup: https://knowledge.workspace.google.com/admin/security/set-up-bimi
