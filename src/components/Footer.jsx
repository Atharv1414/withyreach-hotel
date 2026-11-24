import { useHour } from '../state/hour.jsx'

export default function Footer() {
  const { sun } = useHour()
  return (
    <footer className="footer">
      <div className="footer__in">
        <p className="footer__sun">
          <span>Sunrise here today</span><b>{sun.rise}</b>
          <span>Sunset</span><b>{sun.set}</b>
        </p>
        <p className="footer__note">
          Withyreach is not a real hotel. The site is a design and front-end project by{' '}
          <a href="https://github.com/Atharv1414">Atharv Patil</a>, built with React and SCSS.{' '}
          <a href="https://github.com/Atharv1414/withyreach-hotel">Read the code</a>. Nothing you
          enter is sent anywhere.
        </p>
      </div>
    </footer>
  )
}
