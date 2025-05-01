'use client'

import { motion } from 'framer-motion'

const categories = [
  {
    id: 1,
    name: 'Angol nyelv',
    description: 'Általános és szaknyelvi tankönyvek, munkafüzetek',
    level: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  },
  {
    id: 2,
    name: 'Német nyelv',
    description: 'Nyelvvizsga felkészítők és társalgási gyakorlatok',
    level: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  {
    id: 3,
    name: 'Francia nyelv',
    description: 'Modern nyelvkönyvek minden szinten',
    level: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  {
    id: 4,
    name: 'Spanyol nyelv',
    description: 'Intenzív kurzuskönyvek és gyakorlóanyagok',
    level: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  {
    id: 5,
    name: 'Olasz nyelv',
    description: 'Kezdőtől a felsőfokig, kultúrával fűszerezve',
    level: ['A1', 'A2', 'B1', 'B2', 'C1']
  },
  {
    id: 6,
    name: 'Orosz nyelv',
    description: 'Komplett nyelvtanulási csomagok',
    level: ['A1', 'A2', 'B1', 'B2']
  },
  {
    id: 7,
    name: 'Japán nyelv',
    description: 'JLPT felkészítők és alapozó tankönyvek',
    level: ['N5', 'N4', 'N3', 'N2', 'N1']
  },
  {
    id: 8,
    name: 'Kínai nyelv',
    description: 'HSK vizsgafelkészítők és gyakorlókönyvek',
    level: ['HSK 1', 'HSK 2', 'HSK 3', 'HSK 4']
  },
  {
    id: 9,
    name: 'Üzleti nyelv',
    description: 'Szakmai nyelvkönyvek és kommunikációs készségfejlesztés',
    level: ['B1', 'B2', 'C1']
  },
  {
    id: 10,
    name: 'Nyelvvizsga felkészítők',
    description: 'Célzott felkészülés különböző nyelvvizsgákra',
    type: ['ECL', 'TELC', 'Cambridge', 'Goethe', 'DELE']
  },
  {
    id: 11,
    name: 'Gyerekeknek',
    description: 'Játékos nyelvtanulás kicsiknek',
    ageGroup: ['3-6 év', '7-10 év', '11-14 év']
  },
  {
    id: 12,
    name: 'Egyéb nyelvek',
    description: 'Holland, lengyel, cseh, és további nyelvek',
    level: ['A1', 'A2', 'B1', 'B2']
  }
]

export default function Categories() {
  return (
    <div className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Nyelvkönyvek és oktatási anyagok</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Válogasson több mint 10,000 nyelvkönyv és oktatási segédanyag közül
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 p-6 border border-[rgba(var(--primary-color),0.1)]"
            >
              <h2 className="text-xl font-semibold text-gray-900 group-hover:text-[rgb(var(--primary-color))] transition-colors">
                {category.name}
              </h2>
              <p className="mt-2 text-gray-600 text-sm">{category.description}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {category.level && category.level.map((level) => (
                  <span
                    key={level}
                    className="text-xs px-2 py-1 bg-[rgba(var(--accent-light),0.2)] text-[rgb(var(--primary-color))] rounded-full"
                  >
                    {level}
                  </span>
                ))}
                {category.type && category.type.map((type) => (
                  <span
                    key={type}
                    className="text-xs px-2 py-1 bg-[rgba(var(--accent-light),0.2)] text-[rgb(var(--primary-color))] rounded-full"
                  >
                    {type}
                  </span>
                ))}
                {category.ageGroup && category.ageGroup.map((age) => (
                  <span
                    key={age}
                    className="text-xs px-2 py-1 bg-[rgba(var(--accent-light),0.2)] text-[rgb(var(--primary-color))] rounded-full"
                  >
                    {age}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex justify-between items-center">
                <a
                  href={`/kategoriak/${encodeURIComponent(category.name.toLowerCase())}`}
                  className="text-[rgb(var(--primary-color))] hover:text-[rgb(var(--secondary-color))] text-sm font-medium flex items-center"
                >
                  Részletek
                  <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
                <button className="text-sm text-white bg-[rgb(var(--primary-color))] px-3 py-1 rounded hover:bg-[rgb(var(--secondary-color))] transition-colors">
                  Böngészés
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 bg-[rgba(var(--accent-light),0.1)] rounded-lg p-8 text-center"
        >
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Nem találja amit keres?</h2>
          <p className="text-gray-600 mb-6">
            Szakértő csapatunk szívesen segít a megfelelő tananyag kiválasztásában
          </p>
          <a
            href="/kapcsolat"
            className="btn-primary inline-flex items-center"
          >
            Kapcsolatfelvétel
            <svg className="w-4 h-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </motion.div>
      </div>
    </div>
  )
}