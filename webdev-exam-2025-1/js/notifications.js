const notifications = {
    container: document.getElementById('notifications') || (() => {
        const div = document.createElement('div');
        div.className = 'notifications';
        div.id = 'notifications';
        document.body.appendChild(div);
        return div;
    })(),
    
    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        this.container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, duration);
    },
    
    showSuccess(message) {
        this.show(message, 'success');
    },
    
    showError(message) {
        this.show(message, 'error');
    },
    
    showInfo(message) {
        this.show(message, 'info');
    }
};