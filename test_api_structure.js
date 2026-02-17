

async function checkApi() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/armies/');
        const data = await response.json();
        console.log(JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}

checkApi();
