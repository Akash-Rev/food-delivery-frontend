const Loader = ({ fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        height: "100vh", width: "100%"
      }}>
        <div className="spinner" />
      </div>
    );
  }
  return <div className="spinner" style={{ margin: "2rem auto" }} />;
};

export default Loader;