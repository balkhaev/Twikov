const { request, gql } = require("graphql-request")

const query = gql`
  {
    items(lang: ru, limit: 4000, types: [gun, armor, helmet]) {
      id
      categories {
        id
        name
        normalizedName
      }
      name
      shortName
      normalizedName
      types
      width
      height
      weight
      updated
      baseImageLink
      properties {
        __typename
        ... on ItemPropertiesPreset {
          baseItem {
            id
            name
            normalizedName
            properties {
              ... on ItemPropertiesWeapon {
                defaultPreset {
                  id
                }
              }
            }
          }
        }
        ... on ItemPropertiesWeapon {
          defaultPreset {
            id
          }
          presets {
            id
          }
        }
      }
    }
  }
`

module.exports = async () => {
  const data = await request("https://api.tarkov.dev/graphql", query)

  const byCats = data.items.reduce(
    (acc, cur) => {
      if (cur.types.includes("gun")) {
        acc.guns.push({
          ...cur,
          image: cur.properties.defaultPreset
            ? `https://assets.tarkov.dev/${cur.properties.defaultPreset.id}-512.webp`
            : undefined,
        })
      }
      if (cur.types.includes("armor")) {
        acc.armors.push(cur)
      }
      if (cur.types.includes("helmet")) {
        acc.helmets.push(cur)
      }

      return acc
    },
    { guns: [], armors: [], helmets: [] }
  )

  return byCats
}
