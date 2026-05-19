/* eslint-disable */
const { useState: useStateA, useEffect: useEffectA } = React;

function App() {
  const [route, setRoute] = useStateA("home"); // "home" | "product"

  useEffectA(() => {
    window.scrollTo({ top: 0 });
  }, [route]);

  return (
    <>
      <Nav
        variant={route === "home" ? "dark" : "cream"}
        onLogo={() => setRoute("home")}
        onCategory={() => setRoute("product")}
      />
      {route === "home" ? (
        <Homepage onEnterProduct={() => setRoute("product")} />
      ) : (
        <ProductDetail onBack={() => setRoute("home")} />
      )}
      <Footer />
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
