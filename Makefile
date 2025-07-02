NODE ?= node
NPM  ?= npm
SRC  := src/server.js

all: install

install:
	@echo "Installing dependencies..."
	$(NPM) ci
	@touch data/dev.sqlite

start:
	@echo "Starting server..."
	$(NODE) $(SRC)

clean:
	@echo "Deleting database..."
	@rm -fr data/dev.sqlite

.PHONY: all install start clean