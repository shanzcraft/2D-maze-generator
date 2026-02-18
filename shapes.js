const ShapeDefinitions = {
    square: {
        name: 'Square',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            // All cells are inside square
            return true;
        },
        
        drawOutline: function(ctx, canvasSize) {
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.strokeRect(2, 2, canvasSize - 4, canvasSize - 4);
        },
        
    },

    circle: {
        name: 'Circle',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const radius = canvasSize * 0.45; 
            const dx = centerX - canvasCenter;
            const dy = centerY - canvasCenter;
            const distance = Math.sqrt(dx * dx + dy * dy);
            return distance <= radius;
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const radius = canvasSize * 0.45;
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, Math.PI * 2);
            ctx.stroke();
        },
        
    },

    hexagon: {
        name: 'Hexagon',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            // Calculate hexagon vertices
            const vertices = [];
            for (let i = 0; i < 6; i++) {
                // Start from the top
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                vertices.push({
                    x: canvasCenter + radius * Math.cos(angle),
                    y: canvasCenter + radius * Math.sin(angle)
                });
            }
            
            // Check if point is inside hexagon using ray casting
            return this.pointInPolygon(centerX, centerY, vertices);
        },
        
        pointInPolygon: function(x, y, vertices) {
            let inside = false;
            for (let i = 0, j = vertices.length - 1; i < vertices.length; j = i++) {
                const xi = vertices[i].x, yi = vertices[i].y;
                const xj = vertices[j].x, yj = vertices[j].y;
                
                const intersect = ((yi > y) !== (yj > y))
                    && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
                if (intersect) inside = !inside;
            }
            return inside;
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
        },
        
    },

    decagon: {
        name: 'Decagon',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            const vertices = [];
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
                vertices.push({
                    x: canvasCenter + radius * Math.cos(angle),
                    y: canvasCenter + radius * Math.sin(angle)
                });
            }
            
            return ShapeDefinitions.hexagon.pointInPolygon(centerX, centerY, vertices);
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            for (let i = 0; i < 10; i++) {
                const angle = (Math.PI * 2 / 10) * i - Math.PI / 2;
                const x = center + radius * Math.cos(angle);
                const y = center + radius * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            
            ctx.closePath();
            ctx.stroke();
        },
        
    },

    triangle: {
        name: 'Triangle',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const size = canvasSize * 0.8;
            const height = size * Math.sqrt(3) / 2;
            
            const vertices = [
                { x: canvasCenter, y: canvasCenter - height / 2 }, // Top
                { x: canvasCenter - size / 2, y: canvasCenter + height / 2 }, // Bottom left
                { x: canvasCenter + size / 2, y: canvasCenter + height / 2 }  // Bottom right
            ];
            
            return ShapeDefinitions.hexagon.pointInPolygon(centerX, centerY, vertices);
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const size = canvasSize * 0.8;
            const height = size * Math.sqrt(3) / 2;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(center, center - height / 2);
            ctx.lineTo(center - size / 2, center + height / 2);
            ctx.lineTo(center + size / 2, center + height / 2);
            ctx.closePath();
            ctx.stroke();
        },
        
    },

    diamond: {
        name: 'Diamond',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            const vertices = [
                { x: canvasCenter, y: canvasCenter - radius }, // Top
                { x: canvasCenter + radius, y: canvasCenter }, // Right
                { x: canvasCenter, y: canvasCenter + radius }, // Bottom
                { x: canvasCenter - radius, y: canvasCenter }  // Left
            ];
            
            return ShapeDefinitions.hexagon.pointInPolygon(centerX, centerY, vertices);
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const radius = canvasSize * 0.43;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.moveTo(center, center - radius);
            ctx.lineTo(center + radius, center);
            ctx.lineTo(center, center + radius);
            ctx.lineTo(center - radius, center);
            ctx.closePath();
            ctx.stroke();
        },
        
    },

    trefoil: {
        name: 'Trefoil',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const canvasCenter = canvasSize / 2;
            const lobeRadius = canvasSize * 0.2;
            const offset = canvasSize * 0.15;
            
            // Positioned 120 degrees apart
            const circles = [
                // Top circle
                { x: canvasCenter, y: canvasCenter - offset }, 
                // Bottom left circle
                { x: canvasCenter - offset * Math.cos(Math.PI / 6), y: canvasCenter + offset * Math.sin(Math.PI / 6) },
                // Bottom right circle
                { x: canvasCenter + offset * Math.cos(Math.PI / 6), y: canvasCenter + offset * Math.sin(Math.PI / 6) }  
            ];
            
            // Point is inside if it's within any of the three circles or the center overlap
            for (let circle of circles) {
                const dx = centerX - circle.x;
                const dy = centerY - circle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= lobeRadius) return true;
            }
            
            // Also include center region
            const dxCenter = centerX - canvasCenter;
            const dyCenter = centerY - canvasCenter;
            if (Math.sqrt(dxCenter * dxCenter + dyCenter * dyCenter) <= lobeRadius * 0.5) {
                return true;
            }
            
            return false;
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const lobeRadius = canvasSize * 0.2;
            const offset = canvasSize * 0.15;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            
            // Draw three circles forming trefoil
            const circles = [
                { x: center, y: center - offset },
                { x: center - offset * Math.cos(Math.PI / 6), y: center + offset * Math.sin(Math.PI / 6) },
                { x: center + offset * Math.cos(Math.PI / 6), y: center + offset * Math.sin(Math.PI / 6) }
            ];
            
            circles.forEach(circle => {
                ctx.beginPath();
                ctx.arc(circle.x, circle.y, lobeRadius, 0, Math.PI * 2);
                ctx.stroke();
            });
        },
        
    },

    heart: {
        name: 'Heart',
        
        isInside: function(centerX, centerY, gridSize, canvasSize) {
            const center = canvasSize / 2;
            const size = canvasSize * 0.3;
            
            // Normalize coordinates
            const x = centerX - center;
            const y = centerY - center;
            
            // Check if in top two circles
            const leftLobeX = -size * 0.5;
            const rightLobeX = size * 0.5;
            const lobeY = -size * 0.3;
            const lobeRadius = size * 0.5;
            
            const distLeft = Math.sqrt(Math.pow(x - leftLobeX, 2) + Math.pow(y - lobeY, 2));
            const distRight = Math.sqrt(Math.pow(x - rightLobeX, 2) + Math.pow(y - lobeY, 2));
            
            if (distLeft <= lobeRadius || distRight <= lobeRadius) {
                // Make sure it's in the bottom half of the circles (to form heart top)
                if (y <= lobeY + lobeRadius) {
                    return true;
                }
            }
            
            // Check if in triangular bottom part
            const topY = lobeY;
            const bottomY = size * 1.2;
            
            if (y >= topY && y <= bottomY) {
                // Check if within the triangle bounds
                const ratio = (y - topY) / (bottomY - topY);
                const maxXAtThisY = size * (1 - ratio);
                if (Math.abs(x) <= maxXAtThisY) {
                    return true;
                }
            }
            
            return false;
        },
        
        drawOutline: function(ctx, canvasSize) {
            const center = canvasSize / 2;
            const size = canvasSize * 0.3;
            
            ctx.strokeStyle = '#e8e4d9';
            ctx.lineWidth = 4;
            ctx.beginPath();
            
            // Draw heart
            ctx.moveTo(center, center + size * 1.2);
            ctx.lineTo(center - size, center - size * 0.3);
            ctx.arc(center - size * 0.5, center - size * 0.3, size * 0.5, Math.PI, 0, false);
            ctx.arc(center + size * 0.5, center - size * 0.3, size * 0.5, Math.PI, 0, false);
            ctx.lineTo(center, center + size * 1.2);
            ctx.stroke();
        },
        
    }
};
