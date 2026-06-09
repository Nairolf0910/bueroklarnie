import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export function Datenschutz() {
  return (
    <div className="min-h-screen bg-anthracite-50">
      <Header />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-dark-blue-900 mb-8">Datenschutz</h1>

        <div className="bg-white rounded-xl border border-anthracite-200 p-8 space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              1. Datenschutz auf einen Blick
            </h2>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Allgemeine Hinweise
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen und unsere Services nutzen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Datenerfassung auf dieser Website
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-3">
              <strong className="text-dark-blue-900">Wer ist verantwortlich für die Datenerfassung auf dieser Website?</strong><br />
              Die Datenverarbeitung auf dieser Website erfolgt durch den Websitebetreiber. Dessen Kontaktdaten können Sie dem Impressum dieser Website entnehmen.
            </p>

            <p className="text-anthracite-600 leading-relaxed mb-3">
              <strong className="text-dark-blue-900">Wie erfassen wir Ihre Daten?</strong><br />
              Ihre Daten werden zum einen dadurch erhoben, dass Sie uns diese mitteilen. Hierbei kann es sich z.B. um Daten handeln, die Sie in ein Kontaktformular eingeben.
            </p>

            <p className="text-anthracite-600 leading-relaxed">
              <strong className="text-dark-blue-900">Wofür nutzen wir Ihre Daten?</strong><br />
              Ein Teil der Daten wird erhoben, um eine fehlerfreie Bereitstellung der Website zu gewährleisten. Andere Daten können zur Analyse Ihres Nutzerverhaltens verwendet werden.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              2. Hosting
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Wir hosten die Inhalte unserer Website bei folgendem Anbieter:<br /><br />
              <strong className="text-dark-blue-900">Supabase Inc.</strong><br />
              Die Server des Anbieters befinden sich innerhalb der EU. Weitere Informationen entnehmen Sie der Datenschutzerklärung des Anbieters.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              3. Allgemeine Hinweise und Pflichtinformationen
            </h2>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Datenschutz
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Die Betreiber dieser Seiten nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend den gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Hinweis zur Datenweitergabe in Drittländer
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Wir übermitteln Ihre Daten nur in Länder außerhalb der EU bzw. des EWR, sofern dies zur Vertragserfüllung erforderlich ist oder Sie eingewilligt haben.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Ihre Rechte
            </h3>
            <p className="text-anthracite-600 leading-relaxed">
              Sie haben jederzeit das Recht auf Auskunft über die über Sie gespeicherten Daten. Sie haben jederzeit das Recht auf Berichtigung, Löschung, Einschränkung der Verarbeitung oder Übertragung Ihrer Daten. Zudem haben Sie ein Recht auf Widerruf Ihrer Einwilligung und ein Recht auf Beschwerde bei einer Aufsichtsbehörde.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              4. Datenerfassung auf dieser Website
            </h2>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Registrierung auf dieser Website
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Sie können sich auf dieser Website registrieren, um zusätzliche Funktionen zu nutzen. Die bei der Registrierung eingegebenen Daten werden für die Zwecke der Nutzung des Angebots verwendet. Die Pflichtangaben bei der Registrierung sind vollständig zu erfassen.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Speicherdauer der Daten
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Ihre Daten werden so lange gespeichert, wie dies für die Erbringung unserer Dienstleistungen erforderlich ist oder sofern eine gesetzliche Aufbewahrungspflicht besteht. Nach Ablauf der jeweiligen Fristen werden die Daten routinemäßig gelöscht.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Datei-Upload
            </h3>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Wenn Sie Dokumente über unser Portal hochladen, werden diese verschlüsselt auf unseren Servern gespeichert. Die Dokumente werden ausschließlich für die Zwecke der Vereinbarung verarbeitet und nach Abschluss des Auftrags entsprechend der vereinbarten Aufbewahrungsfristen gelöscht.
            </p>

            <h3 className="text-lg font-medium text-dark-blue-900 mb-2">
              Kontaktformular
            </h3>
            <p className="text-anthracite-600 leading-relaxed">
              Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung des Anliegens und für den Fall von Anschlussfragen bei uns gespeichert.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              5. Soziale Medien
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Auf dieser Website sind keine Social-Media-Plugins eingebunden. Wir nutzen auch keine Social-Media-Dienste für Marketing oder Analytics.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              6. Plugins und Tools
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Diese Website nutzt keine externen Plugins, Analysetools oder Tracking-Dienste.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              7. Ihre Rechte
            </h2>
            <p className="text-anthracite-600 leading-relaxed mb-4">
              Sie haben gegenüber uns folgende Rechte hinsichtlich der Sie betreffenden personenbezogenen Daten:
            </p>
            <ul className="list-disc list-inside text-anthracite-600 space-y-2">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
              <li>Recht auf Beschwerde bei einer Aufsichtsbehörde (Art. 77 DSGVO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              8. Kontakt für Datenschutzanfragen
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              Bei Fragen zum Datenschutz können Sie uns kontaktieren unter:<br /><br />
              BüroKlarNie<br />
              E-Mail: datenschutz@bueroklarnie.de<br />
              Telefon: +49 30 12345678
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-dark-blue-900 mb-4">
              9. Besondere Hinweise
            </h2>
            <p className="text-anthracite-600 leading-relaxed">
              <strong className="text-dark-blue-900">Hinweis zur Steuerberatung:</strong> BüroKlarNie bietet keine steuerliche Beratung an. Die Verarbeitung Ihrer Belege erfolgt ausschließlich zu organisatorischen Zwecken. Für steuerliche Fragen wenden Sie sich bitte an einen qualifizierten Steuerberater.
            </p>
          </section>
        </div>

        <p className="text-sm text-anthracite-500 mt-8">
          Stand: {new Date().toLocaleDateString('de-DE')}
        </p>
      </div>
      <Footer />
    </div>
  );
}
