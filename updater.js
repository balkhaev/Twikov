const { request, gql } = require("graphql-request")

const query = gql`
  {
    items(lang: ru, limit: 2000, type: gun) {
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

module.exports = () => {
  return request("https://api.tarkov.dev/graphql", query).then((data) => {
    const withPresets = data.items.filter(
      (item) => !!item.properties.defaultPreset
    )

    return withPresets.map((item) => ({
      ...item,
      image: `https://assets.tarkov.dev/${item.properties.defaultPreset.id}-512.webp`,
    }))
  })
}
