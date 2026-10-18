# Project commands, from script-tools react_native/. `make` lists them.
# SCRIPT_TOOLS is relative to the project root: make cannot handle the space in its absolute path.
SCRIPT_TOOLS := packages/script-tools
include $(SCRIPT_TOOLS)/react_native/react_native.mk
