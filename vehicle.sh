#!/bin/sh

. ../scripts/envsetup.sh

$RUN_DEBUG$BIN_HOME/dmzAppQt -f config/norender.xml config/terrain.xml config/runtime.xml config/resource.xml config/common.xml config/js.xml config/drive.xml config/net.xml config/console.xml $*
