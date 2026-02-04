async function check() {
    console.log("Testing with parentId=null:");
    const res = await fetch('http://localhost:3001/store/collections?parentId=null');
    const data = await res.json();
    console.log("Count:", data.collections.length);
    data.collections.forEach((c: any) => {
        console.log(`- ${c.name} (Parent: ${c.parentId}, MostShopped: ${c.showInMostShopped})`);
    });

    console.log("\nTesting with includeChildren=true:");
    const res2 = await fetch('http://localhost:3001/store/collections?includeChildren=true');
    const data2 = await res2.json();
    data2.collections.forEach((c: any) => {
        console.log(`- ${c.name} (Children count: ${c.children?.length || 0})`);
    });
}
check();
