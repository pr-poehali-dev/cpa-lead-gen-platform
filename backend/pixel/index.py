'''
Business: Отслеживание кликов и конверсий через пиксель
Args: event - dict с httpMethod, queryStringParameters (offer_id, wm_id, action)
      context - object с request_id
Returns: HTTP response с результатом отслеживания или пиксель-скриптом
'''
import json
import os
from typing import Dict, Any
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor

def get_db_connection():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        request_ctx = event.get('requestContext', {})
        identity = request_ctx.get('identity', {})
        
        ip_address = identity.get('sourceIp', '')
        user_agent = identity.get('userAgent', '')
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            action = params.get('action', 'pixel')
            
            if action == 'pixel':
                pixel_script = '''
(function() {
    var offerId = document.currentScript.getAttribute('data-offer-id');
    if (!offerId) return;
    
    var urlParams = new URLSearchParams(window.location.search);
    var wmId = urlParams.get('wm_id');
    var utmSource = urlParams.get('utm_source');
    var utmMedium = urlParams.get('utm_medium');
    
    if (wmId && utmSource === 'cpasibo_pro' && utmMedium === 'cpl') {
        var img = new Image();
        img.src = window.location.protocol + '//' + window.location.host + 
                  '/api/pixel?action=click&offer_id=' + offerId + 
                  '&wm_id=' + wmId + 
                  '&referrer=' + encodeURIComponent(document.referrer);
    }
    
    window.cpasibo = {
        trackConversion: function() {
            if (wmId && offerId) {
                var img = new Image();
                img.src = window.location.protocol + '//' + window.location.host + 
                          '/api/pixel?action=convert&offer_id=' + offerId + '&wm_id=' + wmId;
            }
        }
    };
})();
'''
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/javascript',
                        'Access-Control-Allow-Origin': '*',
                        'Cache-Control': 'public, max-age=3600'
                    },
                    'body': pixel_script
                }
            
            elif action == 'click':
                offer_id = params.get('offer_id')
                wm_id = params.get('wm_id')
                referrer = params.get('referrer', '')
                
                if not offer_id or not wm_id:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                        'body': '',
                        'isBase64Encoded': False
                    }
                
                cursor.execute("SELECT id FROM offers WHERE id = %s AND status = 'active'", (offer_id,))
                if not cursor.fetchone():
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                        'body': '',
                        'isBase64Encoded': False
                    }
                
                cursor.execute("SELECT id FROM users WHERE id = %s AND role = 'webmaster'", (wm_id,))
                if not cursor.fetchone():
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                        'body': '',
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """
                    INSERT INTO clicks (offer_id, webmaster_id, ip_address, user_agent, referrer, 
                                       utm_source, utm_medium) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (offer_id, wm_id, ip_address, user_agent, referrer, 'cpasibo_pro', 'cpl')
                )
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                    'body': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    'isBase64Encoded': True
                }
            
            elif action == 'convert':
                offer_id = params.get('offer_id')
                wm_id = params.get('wm_id')
                
                if not offer_id or not wm_id:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                        'body': '',
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    "SELECT id, payout FROM offers WHERE id = %s AND status = 'active'",
                    (offer_id,)
                )
                offer = cursor.fetchone()
                
                if not offer:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                        'body': '',
                        'isBase64Encoded': False
                    }
                
                cursor.execute(
                    """
                    SELECT id FROM clicks 
                    WHERE offer_id = %s AND webmaster_id = %s 
                    ORDER BY clicked_at DESC LIMIT 1
                    """,
                    (offer_id, wm_id)
                )
                click = cursor.fetchone()
                
                payout = float(offer['payout'])
                commission = payout * 0.20
                webmaster_payout = payout - commission
                
                cursor.execute(
                    """
                    INSERT INTO conversions (offer_id, webmaster_id, click_id, payout, 
                                            commission, ip_address, status) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    """,
                    (offer_id, wm_id, click['id'] if click else None, 
                     webmaster_payout, commission, ip_address, 'approved')
                )
                
                cursor.execute(
                    "UPDATE users SET balance = balance + %s WHERE id = %s",
                    (webmaster_payout, wm_id)
                )
                
                conn.commit()
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'image/gif', 'Access-Control-Allow-Origin': '*'},
                    'body': 'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
                    'isBase64Encoded': True
                }
        
        cursor.close()
        conn.close()
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }
