#!/bin/sh

. ../scripts/envsetup.sh

$RUN_DEBUG$BIN_HOME/dmzAppQt -f config/author_render.xml config/terrain.xml config/runtime.xml config/resource.xml config/common.xml config/input.xml config/spectator.xml config/js.xml config/author.xml config/author_overlay.xml $*
