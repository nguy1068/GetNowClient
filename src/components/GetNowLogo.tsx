import logoVector from '../assets/logo-vector.png'
import logoGroup from '../assets/logo-group.png'

interface GetNowLogoProps {
  className?: string
}

export default function GetNowLogo({ className }: GetNowLogoProps) {
  return (
    <div className={className} style={{ position: 'relative', width: 142, height: 26.22 }}>
      <img
        alt=""
        src={logoVector}
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          height: '100%',
          width: 'auto',
        }}
      />
      <img
        alt="GetNow"
        src={logoGroup}
        style={{
          position: 'absolute',
          left: '25.64%',
          top: '5.56%',
          bottom: '5.56%',
          right: 0,
          width: 'auto',
          height: 'auto',
          maxHeight: '89%',
        }}
      />
    </div>
  )
}
