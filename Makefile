default: help

# via https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
.PHONY: help
help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: build
build:  ## Build the garagedoorctl:latest image.
	docker build -t garagedoorctl:latest .

.PHONY: run
run: build  ## Run the garagedoorctl:latest image, using .env for env variables.
	docker run -d --name garagedoorctl --restart=always --publish 80:80 --privileged --device=/dev/mem:/dev/mem --env-file .env garagedoorctl:latest

.PHONY: remove
remove:  ## Stop and remove the garagedoorctl container.
	docker stop garagedoorctl
	docker rm garagedoorctl
