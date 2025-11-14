'''
Business: Управление офферами - создание, список, статистика
Args: event - dict с httpMethod, body, queryStringParameters
      context - object с request_id
Returns: HTTP response со списком офферов или результатом операции
'''
import json
import os
from typing import Dict, Any
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
                'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    try:
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            offer_id = params.get('id')
            status = params.get('status', 'active')
            
            if offer_id:
                cursor.execute(
                    """
                    SELECT o.*, u.email as advertiser_email,
                           (SELECT COUNT(*) FROM clicks WHERE offer_id = o.id) as total_clicks,
                           (SELECT COUNT(*) FROM conversions WHERE offer_id = o.id) as total_conversions
                    FROM offers o
                    JOIN users u ON o.advertiser_id = u.id
                    WHERE o.id = %s
                    """,
                    (offer_id,)
                )
                offer = cursor.fetchone()
                
                if not offer:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 404,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Оффер не найден'})
                    }
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps(dict(offer), default=str)
                }
            else:
                cursor.execute(
                    """
                    SELECT o.id, o.name, o.description, o.payout, o.category, o.status,
                           (SELECT COUNT(*) FROM clicks WHERE offer_id = o.id) as clicks,
                           (SELECT COUNT(*) FROM conversions WHERE offer_id = o.id) as conversions
                    FROM offers o
                    WHERE o.status = %s
                    ORDER BY o.created_at DESC
                    """,
                    (status,)
                )
                offers = cursor.fetchall()
                
                cursor.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps([dict(o) for o in offers], default=str)
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            
            name = body_data.get('name', '').strip()
            description = body_data.get('description', '').strip()
            payout = body_data.get('payout', 0)
            category = body_data.get('category', '').strip()
            advertiser_id = body_data.get('advertiser_id')
            
            if not name or not advertiser_id or payout < 500:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'Неверные данные. Минимальная ставка 500₽'})
                }
            
            prepayment_amount = payout * 20
            
            cursor.execute(
                """
                INSERT INTO offers (advertiser_id, name, description, payout, category, 
                                   prepayment_amount, status)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
                RETURNING id
                """,
                (advertiser_id, name, description, payout, category, prepayment_amount, 'pending')
            )
            offer_id = cursor.fetchone()['id']
            
            pixel_code = f'<script src="https://cpasibo.pro/pixel.js" data-offer-id="{offer_id}"></script>'
            
            cursor.execute(
                "UPDATE offers SET pixel_code = %s WHERE id = %s",
                (pixel_code, offer_id)
            )
            
            conn.commit()
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'offer_id': offer_id,
                    'pixel_code': pixel_code,
                    'prepayment_amount': float(prepayment_amount)
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            offer_id = body_data.get('offer_id')
            action = body_data.get('action')
            
            if not offer_id:
                cursor.close()
                conn.close()
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'offer_id обязателен'})
                }
            
            if action == 'activate':
                cursor.execute(
                    "UPDATE offers SET status = 'active' WHERE id = %s AND test_lead_completed = true AND prepayment_paid = true",
                    (offer_id,)
                )
                conn.commit()
                
                if cursor.rowcount == 0:
                    cursor.close()
                    conn.close()
                    return {
                        'statusCode': 400,
                        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                        'body': json.dumps({'error': 'Не выполнены условия активации'})
                    }
            
            elif action == 'test_lead':
                cursor.execute(
                    "UPDATE offers SET test_lead_completed = true WHERE id = %s",
                    (offer_id,)
                )
                conn.commit()
            
            elif action == 'prepayment':
                cursor.execute(
                    "UPDATE offers SET prepayment_paid = true WHERE id = %s",
                    (offer_id,)
                )
                conn.commit()
            
            cursor.close()
            conn.close()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
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
