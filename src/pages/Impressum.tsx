import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Impressum() {
  return (
    <div className="min-h-screen bg-anthracite-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-dark-blue-900 mb-8">Impressum</h1>

        <div className="bg-white rounded-xl border border-anthracite-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Angaben gemäß § 5 TMG
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              BüroKlarNie<br />
              Max Mustermann<br />
              Musterstraße 123<br />
              10115 Berlin
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">Kontakt</h2>
            <p className="text-anthracite-600 leading-relaxed">
              Telefon: +49 30 12345678<br />
              E-Mail: kontakt@bueroklarnie.de
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">Umsatzsteuer-ID</h2>
            <p className="text-anthracite-600 leading-relaxed">
              Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:<br />
              DE 123 456 789
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Berufsbezeichnung und berufsrechtliche Regelungen
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Berufsbezeichnung: Organisationsdienstleister für Belege<br />
              Zuständige Kammer: Industrie- und Handelskammer Berlin<br />
              Es gelten keine berufsrechtlichen Regelungen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Max Mustermann<br />
              Musterstraße 123<br />
              10115 Berlin
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              EU-Streitschlichtung
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
              <a
                href="https://ec.europa.eu/consumers/odr/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-petrol-600 hover:text-petrol-700"
              >
                https://ec.europa.eu/consumers/odr/
              </a>
              <br />
              Unsere E-Mail-Adresse finden Sie oben im Impressum.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Verbraucherstreitbeilegung/Universalschlichtungsstelle
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Haftung für Inhalte
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
            </p>
            <p className="text-anthracite-600 leading-relaxed mt-3">
              Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt. Eine diesbezügliche Haftung ist jedoch erst ab dem Zeitpunkt der Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden von entsprechenden Rechtsverletzungen werden wir diese Inhalte umgehend entfernen.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              Haftung für Links
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">Urheberrecht</h2>
            <p className="text-anthracite-600 leading-relaxed">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </div>
  );
}
