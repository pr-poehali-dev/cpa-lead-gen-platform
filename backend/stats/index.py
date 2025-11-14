'''
Business: Статистика по офферам, кликам и конверсиям
Args: event - dict с httpMethod, queryStringParameters (user_id, role, period)
      context - object с request_id
Returns: HTTP response со статистикой
'''
import json
import os
from typing import Dict, Any
from datetime import datetime, timedelta
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
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'})
        }
    
    try:
        params = event.get('queryStringParameters', {}) or {}
        user_id = params.get('user_id')
        role = params.get('role', 'webmaster')
        period_days = int(params.get('period', '30'))
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id обязателен'})
            }
        
        conn = get_db_connection()
        cursor = conn.cursor(cursor_factory=RealDictCursor)
        
        start_date = datetime.utcnow() - timedelta(days=period_days)
        
        stats = {}
        
        if role == 'webmaster':
            cursor.execute(
                """
                SELECT COUNT(*) as total_clicks
                FROM clicks
                WHERE webmaster_id = %s AND clicked_at >= %s
                """,
                (user_id, start_date)
            )
            stats['total_clicks'] = cursor.fetchone()['total_clicks']
            
            cursor.execute(
                """
                SELECT COUNT(*) as total_conversions, 
                       COALESCE(SUM(payout), 0) as total_earnings
                FROM conversions
                WHERE webmaster_id = %s AND status = 'approved' AND converted_at >= %s
                """,
                (user_id, start_date)
            )
            conv_data = cursor.fetchone()
            stats['total_conversions'] = conv_data['total_conversions']
            stats['total_earnings'] = float(conv_data['total_earnings'])
            
            cursor.execute(
                """
                SELECT COUNT(DISTINCT offer_id) as active_offers
                FROM clicks
                WHERE webmaster_id = %s AND clicked_at >= %s
                """,
                (user_id, start_date)
            )
            stats['active_offers'] = cursor.fetchone()['active_offers']
            
            cursor.execute(
                """
                SELECT DATE(converted_at) as date, COUNT(*) as conversions
                FROM conversions
                WHERE webmaster_id = %s AND status = 'approved' AND converted_at >= %s
                GROUP BY DATE(converted_at)
                ORDER BY date
                """,
                (user_id, start_date)
            )
            stats['daily_conversions'] = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute(
                """
                SELECT o.id, o.name, o.payout,
                       COUNT(cl.id) as clicks,
                       COUNT(cv.id) as conversions,
                       COALESCE(SUM(cv.payout), 0) as earnings
                FROM offers o
                LEFT JOIN clicks cl ON o.id = cl.offer_id AND cl.webmaster_id = %s
                LEFT JOIN conversions cv ON o.id = cv.offer_id AND cv.webmaster_id = %s AND cv.status = 'approved'
                WHERE o.status = 'active'
                GROUP BY o.id, o.name, o.payout
                HAVING COUNT(cl.id) > 0
                ORDER BY conversions DESC
                LIMIT 10
                """,
                (user_id, user_id)
            )
            stats['top_offers'] = [dict(row) for row in cursor.fetchall()]
        
        elif role == 'advertiser':
            cursor.execute(
                """
                SELECT COUNT(DISTINCT c.id) as total_clicks
                FROM clicks c
                JOIN offers o ON c.offer_id = o.id
                WHERE o.advertiser_id = %s AND c.clicked_at >= %s
                """,
                (user_id, start_date)
            )
            stats['total_clicks'] = cursor.fetchone()['total_clicks']
            
            cursor.execute(
                """
                SELECT COUNT(*) as total_conversions,
                       COALESCE(SUM(cv.payout + cv.commission), 0) as total_spent
                FROM conversions cv
                JOIN offers o ON cv.offer_id = o.id
                WHERE o.advertiser_id = %s AND cv.status = 'approved' AND cv.converted_at >= %s
                """,
                (user_id, start_date)
            )
            conv_data = cursor.fetchone()
            stats['total_conversions'] = conv_data['total_conversions']
            stats['total_spent'] = float(conv_data['total_spent'])
            
            cursor.execute(
                """
                SELECT COUNT(*) as active_offers
                FROM offers
                WHERE advertiser_id = %s AND status = 'active'
                """,
                (user_id,)
            )
            stats['active_offers'] = cursor.fetchone()['active_offers']
            
            cursor.execute(
                """
                SELECT o.id, o.name, o.payout as offer_payout, o.status,
                       (SELECT COUNT(*) FROM clicks WHERE offer_id = o.id) as clicks,
                       (SELECT COUNT(*) FROM conversions WHERE offer_id = o.id AND status = 'approved') as conversions,
                       (SELECT COALESCE(SUM(payout + commission), 0) FROM conversions WHERE offer_id = o.id AND status = 'approved') as spent
                FROM offers o
                WHERE o.advertiser_id = %s
                ORDER BY o.created_at DESC
                """,
                (user_id,)
            )
            stats['offers'] = [dict(row) for row in cursor.fetchall()]
        
        elif role == 'admin':
            cursor.execute("SELECT COUNT(*) as total_clicks FROM clicks WHERE clicked_at >= %s", (start_date,))
            stats['total_clicks'] = cursor.fetchone()['total_clicks']
            
            cursor.execute(
                """
                SELECT COUNT(*) as total_conversions,
                       COALESCE(SUM(commission), 0) as total_commission
                FROM conversions
                WHERE status = 'approved' AND converted_at >= %s
                """,
                (start_date,)
            )
            conv_data = cursor.fetchone()
            stats['total_conversions'] = conv_data['total_conversions']
            stats['total_commission'] = float(conv_data['total_commission'])
            
            cursor.execute("SELECT COUNT(*) as active_offers FROM offers WHERE status = 'active'")
            stats['active_offers'] = cursor.fetchone()['active_offers']
            
            cursor.execute(
                """
                SELECT u.id, u.email,
                       COUNT(cv.id) as conversions,
                       COALESCE(SUM(cv.payout), 0) as earnings
                FROM users u
                JOIN conversions cv ON u.id = cv.webmaster_id
                WHERE u.role = 'webmaster' AND cv.status = 'approved' AND cv.converted_at >= %s
                GROUP BY u.id, u.email
                ORDER BY conversions DESC
                LIMIT 10
                """,
                (start_date,)
            )
            stats['top_webmasters'] = [dict(row) for row in cursor.fetchall()]
            
            cursor.execute(
                """
                SELECT o.id, o.name, o.payout,
                       COUNT(DISTINCT cl.id) as clicks,
                       COUNT(DISTINCT cv.id) as conversions,
                       COALESCE(SUM(cv.commission), 0) as commission
                FROM offers o
                LEFT JOIN clicks cl ON o.id = cl.offer_id
                LEFT JOIN conversions cv ON o.id = cv.offer_id AND cv.status = 'approved'
                WHERE o.status = 'active'
                GROUP BY o.id, o.name, o.payout
                ORDER BY conversions DESC
                LIMIT 10
                """,
            )
            stats['top_offers'] = [dict(row) for row in cursor.fetchall()]
        
        cursor.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps(stats, default=str)
        }
    
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Ошибка сервера: {str(e)}'})
        }