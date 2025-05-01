'use client'

import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

export default function AboutUs() {
  const { user } = useAuth()

  return (
    <div className="py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Üdvözöljük a Di-Plant Nyelvkönyvboltban</h1>
          <p className="text-xl text-gray-600">Több mint 30 éve a nyelvtanulás szolgálatában</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-12"
        >
          {/* Általános információk */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-[rgb(var(--primary-color))] mb-6">Rólunk</h2>
            <p className="text-gray-600 mb-6">
              Könyvesboltunk a Gyulai Pál és Kőfaragó utca sarkán található. 
              Megközelíthető a Blaha Lujza tértől, a Rókus kápolnától 2 perc sétával. 
              Ha busszal érkezik, akkor az Uránia mozi megállónál kell leszállni.
              Gépkocsival a Vas utcán lehet bejönni, és onnan a második keresztutca balra.
            </p>
          </div>

          {/* Kapcsolat */}
          <div className="bg-[rgba(var(--primary-color),0.03)] rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-[rgb(var(--primary-color))] mb-6">Kapcsolat</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Céginformációk</h3>
                  <div className="mt-2 space-y-2 text-gray-600">
                    <p>Név: Di-Plant Idegennyelvű könyvesbolt</p>
                    <p>Cím: 1085 Budapest Gyulai Pál utca 16.</p>
                    <p>Adószám: 14868795-2-41</p>
                    <p>Cégjegyzékszám: 01-09-923752</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Nyitvatartás</h3>
                  <p className="mt-2 text-gray-600">Hétfőtől-Péntekig 10-18 óráig</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900">Elérhetőségek</h3>
                  <div className="mt-2 space-y-2">
                    <p className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-[rgb(var(--primary-color))] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      rendeles@diplant-nyelvkonyvbolt.hu
                    </p>
                    <p className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-[rgb(var(--primary-color))] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      06 1 338 39 49
                    </p>
                    <p className="flex items-center text-gray-600">
                      <svg className="w-5 h-5 text-[rgb(var(--primary-color))] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Fax: 06 1338 44 96
                    </p>
                  </div>
                </div>
                {!user ? (
                  <div className="bg-[rgba(var(--accent-light),0.1)] p-4 rounded-md">
                    <p className="text-gray-600 text-sm">
                      Közvetlen üzenetküldéshez kérjük, jelentkezzen be vagy regisztráljon.
                    </p>
                  </div>
                ) : (
                  <div>
                    <h3 className="font-medium text-gray-900">Közvetlen üzenet</h3>
                    <button className="mt-2 px-4 py-2 bg-[rgb(var(--primary-color))] text-white rounded-md hover:bg-[rgb(var(--secondary-color))] transition-colors">
                      Üzenet küldése
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Térkép */}
          <div className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-semibold text-[rgb(var(--primary-color))] mb-6">Térkép</h2>
            <div className="aspect-[16/9] bg-gray-100 rounded-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2695.856924643403!2d19.068446776772443!3d47.49375619618171!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4741dc41b3e5b2e9%3A0xbb8974c0e67ada6c!2zR3l1bGFpIFDDoWwgdS4gMTYsIEJ1ZGFwZXN0LCAxMDg1!5e0!3m2!1sen!2shu!4v1682924437074!5m2!1sen!2shu"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}