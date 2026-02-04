async function check() {
    const res = await fetch('http://localhost:3001/store/homepage-collections');
    const data = await res.json();
    console.log("Collections:", data.collections.length);
    if (data.collections.length > 0) {
        const first = data.collections[0];
        console.log("First collection title:", first.title);
        console.log("Products count:", first.products.length);
        if (first.products.length > 0) {
            console.log("First product join object keys:", Object.keys(first.products[0]));
            if (first.products[0].product) {
                console.log("Product name:", first.products[0].product.name);
            }
        }
    }
}
check();
