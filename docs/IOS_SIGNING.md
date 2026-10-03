# iOS builds and signing

The repository has two separate iOS paths:

- **Simulator build:** run the `Build Fishing Free iOS Simulator` workflow from GitHub Actions. It produces an unsigned `.app` archive for the iOS Simulator. This is useful to confirm that the native iOS wrapper compiles, but it cannot be installed on an iPhone.
- **Installable IPA:** run `Build Fishing Free iOS IPA` after setting up an Apple Developer Program team and the distribution certificate, password, provisioning profile, and team ID secrets required by `.github/workflows/ios-ipa.yml`.

Apple says a free Apple Account can be used to test apps on the account owner's devices through Xcode. That route needs access to a Mac with Xcode and the device; the GitHub-hosted simulator build does not sign or install on a physical phone. Apple requires Developer Program membership for distribution to registered devices, TestFlight, or the App Store; Apple currently lists membership at US$99 per year. The owner has confirmed an Apple ID but no program membership, so the native IPA path is deferred and Safari/PWA remains the available iPhone route.

Do not put an Apple Account password or two-factor code in GitHub Actions secrets. The signed workflow uses the exported certificate and provisioning profile instead.

References: [Apple Developer Program and membership pricing](https://developer.apple.com/programs/), [Apple's membership comparison](https://developer.apple.com/support/compare-memberships/), [Apple's Xcode distribution guidance](https://developer.apple.com/documentation/xcode/distributing-your-app-for-beta-testing-and-releases).
