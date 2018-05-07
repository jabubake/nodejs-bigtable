/**
 * Copyright 2018 Google LLC
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *    http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

// Imports the Google Cloud client library
const Bigtable = require('@google-cloud/bigtable');

const INSTANCE_ID = process.env.INSTANCE_ID;
const TABLE_ID = "Bigtable-table";

if (!INSTANCE_ID) {
  throw new Error('Environment variables for INSTANCE_ID must be set!');
}
// TODO : table must already exist or be created

// [START bigtable_family_ref]
const bigtableClient = bigtable();
const instance = bigtableClient.instance(INSTANCE_ID);
const table = instance.table(TABLE_NAME);
const family = table.family(COLUMN_FAMILY_NAME)
// [END bigtable_family_ref]

// [START bigtable_create_family]
const rule = {
    versions: 1
};  
family.create(rule, function(err, family, apiResponse) {
    // The column family was created successfully.
    if (err) {
        console.error(`Error creating column family: ${error}`);
    } else {
        console.log(`Created column family: ${family}`);
    }
});
// [END bigtable_create_family]

// [START bigtable_get_family_if_exists]
// 
family.get(function(err, family, apiResponse) {
    if (err) {
        if (err.code == 5) {
          console.error('Column family does not exist');
        } else {
          console.error(`Error retrieving family: ${error}`);
        }
    } else {
        console.log(`ID: ${family.id}, Metadata: ${family.metadata}`);
    }   
});
// [END bigtable_get_family_if_exists]

// [START bigtable_get_or_create_family]
// Auto-create family if does not exist
const options = { 
    autoCreate: true,
    // provide GC rule (example: only retain latest version) 
    rule:{
      versions: 1
}};
family.get(options, function(err, family, apiResponse) {
    if (err) {
        console.error(`Error getting/creating family: ${error}`);
    } else {
        console.log(`ID: ${family.id}, Metadata: ${family.metadata}`);
    }  
});
// [END bigtable_get_or_create_family]

// [START bigtable_family_check_exists]
// Check if a column family exists
family.exists(function(err, exists) {
    if (err) {
        console.error(`Error checking existance of family: ${family.id}`)
    } else {
        console.log(`${family.id} exists: ${exists}`);
    }
});
// [END bigtable_family_check_exists]

// [START bigtable_family_get_metadata]
// Retrieve column family metadata (Id, column family GC rule)
family.getMetadata(function(err, metadata, apiResponse) {
    if (err) {
        console.error(`Error retrieving family metadata: ${family.id}`);
    } else {
        console.log(`Metadata: ${metadata}`);
    }
});
// [END bigtable_family_get_metadata]

// [START bigtable_update_gc_rule]
// Update the column family GC rule
var metadata = {
    rule: {
         age: {
             seconds: 0,
             nanos: 8000
         }
    }
 };
family.setMetadata(metadata, function(err, apiResponse) {
    if (err) {
        console.error(`Error updating GC rule: ${family.id}`);
    } else {
        console.log(`Updated GC rule: ${apiResponse}`);
    }
});
// [END bigtable_update_gc_rule]

// [START bigtable_delete_family]
family.delete(function(err, apiResponse) {
    if (err) {
        console.error(`Error deleting family: ${family.id}`)
    } else {
        console.log(`${family.id} deleted successfully`);
    }
});
// [END bigtable_delete_family]
