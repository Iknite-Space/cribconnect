
MAKEFILE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

CF_DIR := $(MAKEFILE_DIR)cloudformation

generate:
	@echo "No generation implemented for infra"	

lint:
	@echo "No linting implemented for infra"	


test:
	@echo "No testing implemented for infra"

cloudformation/aws-cloudformation-templates/core-components:
	@echo "Initializing Submodule with AWS Cloudformation templates"
	git submodule update --init .//cloudformation/aws-cloudformation-templates 

publish: cloudformation/aws-cloudformation-templates/core-components ## Publish Cloudformation templates to S3. usage: make publish bucket_name=my-bucket artifact_hash=123
	aws s3 sync $(CF_DIR) s3://$(bucket_name)/cloudformation/$(artifact_hash)

.PHONY: test publish

