# Project commands, from script-tools react_native/. `make` lists them.
# SCRIPT_TOOLS is relative to the project root: make cannot handle the space in its absolute path.
SCRIPT_TOOLS := packages/script-tools
include $(SCRIPT_TOOLS)/react_native/react_native.mk

# Version name and build number of each platform: app-version.json is the one
# place they live. P=ios or P=android changes one platform; without it, both.
.PHONY: version bump-build bump-patch bump-minor bump-major set-version
version: ## Copy the iOS pair of app-version.json into the Xcode project and print both
	node scripts/app-version.js sync
bump-build: ## Build number + 1 [P=ios|android]
	node scripts/app-version.js bump build $(P)
bump-patch: ## 1.2.3 -> 1.2.4, build + 1 [P=ios|android]
	node scripts/app-version.js bump patch $(P)
bump-minor: ## 1.2.3 -> 1.3.0, build + 1 [P=ios|android]
	node scripts/app-version.js bump minor $(P)
bump-major: ## 1.2.3 -> 2.0.0, build + 1 [P=ios|android]
	node scripts/app-version.js bump major $(P)
set-version: ## That version, build + 1 [V=1.2.0] [P=ios|android]
	node scripts/app-version.js set $(V) $(P)

# The iOS app reads its version from the Xcode project: sync it before every run.
run-ios run-android: version
