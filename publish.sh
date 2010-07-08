#!/bin/sh

. ../scripts/envsetup.sh

$RUN_DEBUG$BIN_HOME/dmzAppQt -f config/runtime.xml config/common.xml config/publish.xml config/js.xml config/net.xml config/ship.xml $*
