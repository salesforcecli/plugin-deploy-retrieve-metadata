# description

deploy source to a salesforce org

# examples

- sf project deploy org --metadata ApexClass
- sf project deploy org --manifest package.xml
- sf project deploy org --directory force-app

# metadata

list of metadata component names

# manifest

file path for manifest (package.xml) of components to deploy

# directory

list of paths to the local source files to deploy

# target-env

environment you want to deploy to

# NoTargetEnv

no target environment specified

# NoTargetEnvActions

- specify target environment with the --target-env flag
- set the default environment with "sf config set defaultusername"
