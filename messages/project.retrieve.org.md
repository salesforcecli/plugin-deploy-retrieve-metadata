# summary

Retrieve source from an org.

# description

The source you retrieve overwrites the corresponding source files in your local project . This command doesn’t attempt to merge the source from your org with your local source files. If the command detects a conflict, it displays the conflicts but doesn’t complete the process. After reviewing the conflict, rerun the command with the --force-overwrite flag to overwrite your local files.

If the comma-separated list you’re supplying contains spaces, enclose the entire comma-separated list in one set of double quotes. On Windows, if the list contains commas, also enclose the entire list in one set of double quotes.

You must run this command from wihin a project.

# examples

- Retrieve the source files in a directory:

      sf project retrieve org --source-path path/to/source

- Retrieve a specific Apex class and the objects whose source is in a directory:

      sf project retrieve org --source-path "path/to/apex/classes/MyClass.cls,path/to/source/objects"

- Retrieve source files in a comma-separated list that contains spaces:

      sf project retrieve org --source-path "path/to/objects/MyCustomObject/fields/MyField.field-meta.xml, path/to/apex/classes"

- Retrieve all Apex classes:

      sf project retrieve org --metadata ApexClass

- Retrieve a specific Apex class:

      sf project retrieve org --metadata ApexClass:MyApexClass

- Retrieve all custom objects and Apex classes:

      sf project retrieve org --metadata "CustomObject,ApexClass"

- Retrieve all metadata components listed in a manifest:

      sf project retrieve org --manifest path/to/package.xml

- Retrieve metadata from a package:

      sf project retrieve org --package-names MyPackageName

- Retrieve metadata from multiple packages:

      sf project retrieve org --package-names "Package1, PackageName With Spaces, Package3"

# flags.api-version.summary

target API version for the retrieve

# flags.manifest.summary

file path for manifest (package.xml) of components to deploy

# flags.metadata.summary

comma-separated list of metadata component names

# flags.package-name.summary

a comma-separated list of packages to retrieve

# flags.retrieve-target-dir.summary

directory root for the retrieved files

# flags.single-package.summary

Indicates that the zip file points to a directory structure for a single package

# flags.source-dir.summary

source dir to use instead of the default package dir in sfdx-project.json

# flags.target-org.summary

Username or alias of the org you want to retrieve from

# flags.force-overwrite.summary

overwrites local data

# flags.wait.summary

wait time for command to finish in minutes
