# summary

Deploy source to an org.

# description

You must run this command from wihin a project.

The source you deploy overwrites the corresponding metadata in your org. This command doesn’t attempt to merge your source with the versions in your org.

If the comma-separated list you’re supplying contains spaces, enclose the entire comma-separated list in one set of double quotes. On Windows, if the list contains commas, also enclose the entire list in one set of double quotes.

# examples

- Deploy the source files in a directory:

  <%= config.bin %> <%= command.id %> --deploy-dir path/to/source

- Deploy a specific Apex class and the objects whose source is in a directory:

  <%= config.bin %> <%= command.id %> --deploy-dir "path/to/apex/classes/MyClass.cls,path/to/source/objects"

- Deploy source files in a comma-separated list that contains spaces:

  <%= config.bin %> <%= command.id %> --deploy-dir "path/to/objects/MyCustomObject/fields/MyField.field-meta.xml, path/to/apex/classes"

- Deploy all Apex classes:

  <%= config.bin %> <%= command.id %> --metadata ApexClass

- Deploy a specific Apex class:

  <%= config.bin %> <%= command.id %> --metadata ApexClass:MyApexClass

- Deploy all custom objects and Apex classes:

  <%= config.bin %> <%= command.id %> --metadata "CustomObject,ApexClass"

- Deploy all Apex classes and two specific profiles (one of which has a space in its name):

  <%= config.bin %> <%= command.id %> --metadata "ApexClass, Profile:My Profile, Profile: AnotherProfile"

- Deploy all components listed in a manifest:

  <%= config.bin %> <%= command.id %> --manifest path/to/package.xml

# flags.metadata

Space-separated list of metadata component names to deploy.

# flags.manifest

Full file path for manifest (package.xml) of components to deploy.

# flags.deploy-dir

Root of local directory tree of files to deploy.

# flags.target-org

Username or alias of the org you want to deploy to

# NoTargetEnv

no target environment specified

# NoTargetEnvActions

- specify target environment with the --target-env flag
- set the default environment with "sf config set defaultusername"
