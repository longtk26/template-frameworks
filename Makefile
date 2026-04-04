run:
	go run cmd/main.go
gorm-gen:
	gorm gen -i ./app/models -o ./app/generated
newmg:
	migrate create -ext sql -dir migrations $(name)
up:
	@bash scripts/migrate-up.sh $(version)
upto:
	@bash scripts/migrate-upto.sh $(version)
down:
	@bash scripts/migrate-down.sh $(version)
downto:
	@bash scripts/migrate-downto.sh $(version)

.PHONY: run gorm-gen newmg up upto down downto