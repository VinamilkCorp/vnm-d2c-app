.PHONY: init
init: postinstall shortcut

.PHONY: postinstall
postinstall:
	npx husky install

.PHONY: prepare
prepare: link env-pull

.PHONY: shortcut
shortcut: ## Creates a global h2 shortcut for Shopify CLI using shell aliases.
	npx shopify hydrogen shortcut

.PHONY: list
list: ## Lists all Hydrogen storefronts available to link to your local development environment.
	npx shopify hydrogen list

.PHONY: link
link: ## Links your local development environment to a remote Hydrogen storefront.
	npx shopify hydrogen link

.PHONY: unlink
unlink: ## Unlinks your local development environment from a remote Hydrogen storefront.
	npx shopify hydrogen unlink

.PHONY: env-list
env-list: # Lists all environments available on the linked Hydrogen storefront.
	npx shopify hydrogen env list

.PHONY: env-pull
env-pull: ## Pulls environment variables from the linked Hydrogen storefront and writes them to an .env file.
	npx shopify hydrogen env pull

.PHONY: vnmdev
vnmdev: ## Local Vinamilk start development.
	NODE_TLS_REJECT_UNAUTHORIZED=0 npx shopify hydrogen dev
