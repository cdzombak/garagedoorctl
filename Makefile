default: help

.PHONY: help
help:  # via https://marmelab.com/blog/2016/02/29/auto-documented-makefile.html
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

.PHONY: clean
clean:  ## Remove the build output artifacts.
	rm -rf ./out

.PHONY: build
build: clean  ## Build the garagedoorctl:latest image.
	docker build -t garagedoorctl:latest .

.PHONY: save-tar
save-tar: build  ## Build and `docker save` the garagedoorctl:latest image. Use `docker load` to reimport it.
	mkdir -p ./out/
	docker save -o ./out/garagedoorctl-latest.tar garagedoorctl:latest

.PHONY: run
run: build  ## Build and run the garagedoorctl server, using ./.env for env variables.
	docker run -d --name garagedoorctl --restart=always --publish 80:80 --privileged --device=/dev/mem:/dev/mem --env-file ./.env garagedoorctl:latest

.PHONY: remove
remove:  ## Stop and remove the garagedoorctl container.
	docker stop garagedoorctl
	docker rm garagedoorctl
