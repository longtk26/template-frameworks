run:
	pnpm start:dev
newmg:
	pnpm db:generate --name "$(name)"
mghead:
	pnpm db:migrate
mgdrop:
	pnpm db:drop

.PHONY: run newmg mghead mgdrop
