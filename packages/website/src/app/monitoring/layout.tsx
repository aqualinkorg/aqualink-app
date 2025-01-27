import NavBar from 'common/NavBar';

export default function MonitoringLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <NavBar searchLocation={false} />
      {children}
    </>
  );
}
