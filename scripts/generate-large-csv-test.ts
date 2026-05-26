import { createWriteStream } from "node:fs";
import { resolve } from "node:path";

const rowCount = Number(process.argv[2] ?? 60000);
const outputPath = resolve(process.cwd(), "large-import-test.csv");
const regions = ["Est", "Ouest", "Nord", "Sud"];
const interventionTypes = ["Maintenance", "Installation", "Audit", "Urgence"];
const clients = ["Nova Services", "Helio Conseil", "Maison Lumen", "Atelier Boréal", "Synapse Habitat"];

const stream = createWriteStream(outputPath, { encoding: "utf8" });

stream.write("date;client;region;montant_ht;marge;retard;satisfaction;type_intervention\n");

for (let index = 0; index < rowCount; index += 1) {
  const day = String((index % 28) + 1).padStart(2, "0");
  const month = String((index % 12) + 1).padStart(2, "0");
  const amount = 700 + (index % 90) * 23;
  const margin = 18 + (index % 20);
  const late = index % 9 === 0 ? "oui" : "non";
  const satisfaction = 65 + (index % 35);
  const row = [
    `2026-${month}-${day}`,
    clients[index % clients.length],
    regions[index % regions.length],
    amount,
    margin,
    late,
    satisfaction,
    interventionTypes[index % interventionTypes.length]
  ].join(";");

  stream.write(`${row}\n`);
}

stream.end(() => {
  console.log(`CSV de test généré : ${outputPath} (${rowCount.toLocaleString("fr-FR")} lignes)`);
});
