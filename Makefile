.PHONY: infra up down reset logs ps config tools smoke

infra:   ## postgres + kafka + redis only
	docker compose up -d

up:      ## full stack
	docker compose --profile core up -d --build

tools:   ## kafka ui on http://localhost:8090
	docker compose --profile tools up -d kafka-ui

down:    ## stop everything, keep data
	docker compose --profile core --profile tools down

reset:   ## stop everything and DELETE data (re-runs the postgres init script)
	docker compose --profile core --profile tools down -v

logs:    ## make logs s=identity
	docker compose logs -f $(s)

ps:
	docker compose --profile core ps

config:  ## validate compose.yaml
	docker compose --profile core --profile tools config -q && echo "compose.yaml OK"

smoke:
	bash scripts/smoke.sh