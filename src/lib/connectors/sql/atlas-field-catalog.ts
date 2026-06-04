export type AtlasSqlFieldCategory = "identity" | "organization" | "operations" | "finance" | "product" | "metadata";

export type AtlasFieldCatalogItem = {
  id: string;
  label: string;
  category: AtlasSqlFieldCategory;
  description: string;
  required?: boolean;
  unique?: boolean;
};

export const atlasFieldCatalog: AtlasFieldCatalogItem[] = [
  {
    id: "company",
    label: "Entreprise",
    category: "organization",
    description: "Entreprise ou organisation rattachee a la ligne."
  },
  {
    id: "client",
    label: "Client",
    category: "identity",
    description: "Client, compte ou donneur d'ordre.",
    required: true,
    unique: true
  },
  {
    id: "project",
    label: "Projet",
    category: "operations",
    description: "Projet, chantier ou initiative rattachee."
  },
  {
    id: "mission",
    label: "Mission",
    category: "operations",
    description: "Mission, intervention ou prestation."
  },
  {
    id: "date",
    label: "Date",
    category: "metadata",
    description: "Date de reference, realisation, creation ou cloture.",
    required: true,
    unique: true
  },
  {
    id: "region",
    label: "Region",
    category: "organization",
    description: "Region commerciale ou operationnelle."
  },
  {
    id: "agency",
    label: "Agence",
    category: "organization",
    description: "Agence, site ou equipe locale."
  },
  {
    id: "amount",
    label: "Montant",
    category: "finance",
    description: "Montant, chiffre d'affaires ou valeur financiere.",
    unique: true
  },
  {
    id: "cost",
    label: "Cout",
    category: "finance",
    description: "Cout, charge ou depense.",
    unique: true
  },
  {
    id: "quantity",
    label: "Quantite",
    category: "operations",
    description: "Volume, quantite, nombre d'elements."
  },
  {
    id: "status",
    label: "Statut",
    category: "metadata",
    description: "Statut metier ou avancement."
  },
  {
    id: "user",
    label: "Utilisateur",
    category: "identity",
    description: "Utilisateur, proprietaire ou responsable."
  },
  {
    id: "intervention",
    label: "Intervention",
    category: "operations",
    description: "Intervention terrain ou operation client."
  },
  {
    id: "reference",
    label: "Reference",
    category: "identity",
    description: "Identifiant, reference ou code externe."
  },
  {
    id: "product",
    label: "Produit",
    category: "product",
    description: "Produit, service ou offre."
  },
  {
    id: "category",
    label: "Categorie",
    category: "metadata",
    description: "Categorie, type ou famille."
  }
];

export function getAtlasFieldById(id?: string) {
  if (!id) return undefined;
  return atlasFieldCatalog.find((field) => field.id === id);
}

export function getRequiredAtlasFields() {
  return atlasFieldCatalog.filter((field) => field.required);
}
