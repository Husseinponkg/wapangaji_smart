const API_URL='/api/auth/register';
const form=document.getElementById('registerForm');

form.addEventListener('submit',async (event)=>{
    event.preventDefault();

    // Get form data
    const f_name = document.getElementById('f_name').value;
    const l_name = document.getElementById('l_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.querySelector('input[name="role"]:checked').value;
    //const payment_method = document.getElementById('payment_method').value;
    
    // Create JSON data object
    const userData = {
        f_name,
        l_name,
        email,
        password,
        role,
     
    };

    // Send request to server
    const response=await fetch(API_URL,{
        method:'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    });

    if(response.ok){
        const data=await response.json();
        console.log('Registration successful:',data);
        alert('Registration successful!');
        // Redirect to dashboard based on role
        if (role === 'dalali') {
            window.location.href = 'dalali_dashboard.html';
        } else if (role === 'mpangaji') {
            window.location.href = 'mpangaji-dashboard.html';
        } else {
            window.location.href = 'payment.html';
        }
    }else{
        const error=await response.json();
        console.error('Registration failed:',error);
        alert('Registration failed: ' + error.error);
    }
});
