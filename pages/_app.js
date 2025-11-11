export async function getExchangeRate(fromCode, toCode) {
  try {
    const r = await fetch(`https://api.exchangerate.host/convert?from=${fromCode}&to=${toCode}`);
    const j = await r.json(); return j.result || null;
  } catch(e){ console.error(e); return null; }
}
export async function getNumbeoCountryIndex(countryName) {
  const key = process.env.NUMBEO_KEY || '';
  if (!key) {
    const sample = { India:{cost_index:60,rent_index:40}, Germany:{cost_index:130,rent_index:140}, "United States":{cost_index:140,rent_index:160} };
    return sample[countryName] || { cost_index:100, rent_index:100 };
  }
  try {
    const url = `https://www.numbeo.com/api/country_prices?api_key=${key}&query=${encodeURIComponent(countryName)}`;
    const r = await fetch(url); const j = await r.json();
    return { cost_index: j.cost_index || j.prices_index || 100, rent_index: j.rent_index || 100 };
  } catch(e){ console.error(e); return { cost_index:100, rent_index:100 }; }
}
