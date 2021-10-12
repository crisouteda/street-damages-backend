import avro from "avsc";

export default avro.Type.forSchema({
  type: "record",
  fields: [
    {
      name: "damage",
      type: { type: "enum", symbols: ["follenTree", "shit", "brokenTile"] },
    },
    {
      name: "geolocation",
      type: {
        type: "map",
        values: "float",
      },
    },
    {
      name: "date",
      type: "float",
    },
    {
      name: "province",
      type: "string",
    },
  ],
});
