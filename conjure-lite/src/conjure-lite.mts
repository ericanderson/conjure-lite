#!/bin/env node

void import("./cli.js").then((mod) => {
  void mod.cli();
});
