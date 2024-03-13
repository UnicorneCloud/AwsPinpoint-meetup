export const PersonalizeInteractionSchema = {
  type: "record",
  name: "Interactions",
  namespace: "com.amazonaws.personalize.schema",
  fields: [
    {
      name: "USER_ID",
      type: "string"
    },
    {
      name: "ITEM_ID",
      type: "string"
    },
    {
      name: "EVENT_TYPE",
      type: "string"
    },
    {
      name: "TIMESTAMP",
      type: "long"
    },
    {
      name: "Id",
      type: "string"
    },
  ],
  version: "1.0"
}

export const PersonalizeUserSchema = {
	"type": "record",
	"name": "Users",
	"namespace": "com.amazonaws.personalize.schema",
	"fields": [
		{
			"name": "USER_ID",
			"type": "string"
		},
		{
			"name": "Email",
			"type": "string"
		},
		{
			"name": "FullName",
			"type": "string"
		},
		{
			"name": "Age",
			"type": "int"
		},
		{
			"name": "Gender",
			"type": "string",
			"categorical": true
		}
	],
	"version": "1.0"
}

export const PersonalizeItemsSchema = {
	"type": "record",
	"name": "Items",
	"namespace": "com.amazonaws.personalize.schema",
	"fields": [
		{
			"name": "ITEM_ID",
			"type": "string"
		},
		{
			"name": "Category",
			"type": "string",
			"categorical": true
		}
	],
	"version": "1.0"
}