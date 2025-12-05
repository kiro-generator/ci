# CI all the things

This action produces a JSON string config output which is used to configure the CI pipeline.

It uses [yq](https://github.com/mikefarah/yq) to merge the YAML configuration files.

See [rust-default.yml](./.github/ci-configs/rust-default.yml) for the default rust CI pipeline configuration
