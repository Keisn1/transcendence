NODE ?= node
NPM  ?= npm
SRC  := src/server.js

all: install

install:
	@echo "Installing dependencies…"
	$(NPM) ci

start:
	@echo "Starting server…"
	$(NODE) $(SRC)

.PHONY: all install start 