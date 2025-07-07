#!/usr/bin/env node

void import("@conjure-lite/cli").then((mod) => {
  void mod.cli();
});
