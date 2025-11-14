import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Icon from '@/components/ui/icon';
import { toast } from 'sonner';

type UserRole = 'advertiser' | 'webmaster' | 'admin';

interface Offer {
  id: number;
  name: string;
  description: string;
  payout: number;
  category: string;
  clicks: number;
  conversions: number;
  status: 'active' | 'pending' | 'paused';
}

const Index = () => {
  const [userRole, setUserRole] = useState<UserRole>('advertiser');
  const [selectedTab, setSelectedTab] = useState('home');

  const mockOffers: Offer[] = [
    {
      id: 1,
      name: 'Онлайн-школа программирования',
      description: 'Курсы по разработке ПО для начинающих и профессионалов',
      payout: 2500,
      category: 'Образование',
      clicks: 1234,
      conversions: 67,
      status: 'active'
    },
    {
      id: 2,
      name: 'Доставка продуктов',
      description: 'Сервис доставки продуктов питания по городу',
      payout: 850,
      category: 'E-commerce',
      clicks: 3421,
      conversions: 156,
      status: 'active'
    },
    {
      id: 3,
      name: 'Юридические услуги',
      description: 'Консультации и сопровождение юридических процессов',
      payout: 3200,
      category: 'Услуги',
      clicks: 892,
      conversions: 34,
      status: 'pending'
    }
  ];

  const statsData = {
    totalClicks: 12547,
    totalConversions: 687,
    totalEarnings: userRole === 'webmaster' ? 1247800 : 1559750,
    activeOffers: 24
  };

  const renderHero = () => (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-accent/5 to-background py-20 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col items-center text-center space-y-8 animate-fade-in">
          <Badge variant="secondary" className="px-4 py-2 text-sm font-medium">
            <Icon name="Zap" size={16} className="mr-2" />
            CPA платформа нового поколения
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            CPAsibo Pro
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl">
            Автоматизированная платформа для генерации лидов с прозрачной статистикой и честными выплатами
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Button size="lg" className="text-lg px-8 hover:scale-105 transition-transform" onClick={() => setSelectedTab('offers')}>
              <Icon name="TrendingUp" size={20} className="mr-2" />
              Начать зарабатывать
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 hover:scale-105 transition-transform" onClick={() => setSelectedTab('cabinet')}>
              <Icon name="Plus" size={20} className="mr-2" />
              Добавить оффер
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 w-full max-w-4xl">
            {[
              { icon: 'Target', value: '500₽', label: 'Мин. ставка' },
              { icon: 'Percent', value: '20%', label: 'Комиссия' },
              { icon: 'Zap', value: 'Real-time', label: 'Статистика' },
              { icon: 'Shield', value: '100%', label: 'Гарантия выплат' }
            ].map((stat, idx) => (
              <div key={idx} className="flex flex-col items-center space-y-2 p-4 rounded-xl bg-card/50 backdrop-blur animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                <Icon name={stat.icon as any} size={32} className="text-primary" />
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderOffers = () => (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">Активные офферы</h2>
          <p className="text-muted-foreground">Выберите оффер и начните зарабатывать</p>
        </div>
        <div className="flex gap-2">
          <Input placeholder="Поиск офферов..." className="w-64" />
          <Button variant="outline">
            <Icon name="Filter" size={20} />
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockOffers.map((offer, idx) => (
          <Card key={offer.id} className="hover:shadow-xl transition-all hover:-translate-y-1 animate-scale-in" style={{ animationDelay: `${idx * 0.1}s` }}>
            <CardHeader>
              <div className="flex justify-between items-start mb-2">
                <Badge variant={offer.status === 'active' ? 'default' : 'secondary'}>
                  {offer.status === 'active' ? 'Активен' : 'На модерации'}
                </Badge>
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary">
                  {offer.category}
                </Badge>
              </div>
              <CardTitle className="text-xl">{offer.name}</CardTitle>
              <CardDescription className="line-clamp-2">{offer.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <span className="text-sm text-muted-foreground">Выплата за лид</span>
                  <span className="text-2xl font-bold text-primary">{offer.payout.toLocaleString()}₽</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="MousePointer" size={16} className="text-muted-foreground" />
                    <span>{offer.clicks.toLocaleString()} кликов</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-accent" />
                    <span>{offer.conversions} конверсий</span>
                  </div>
                </div>

                <Button className="w-full" disabled={offer.status !== 'active'}>
                  <Icon name="Link" size={18} className="mr-2" />
                  Получить ссылку
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderCabinet = () => (
    <div className="container mx-auto max-w-6xl py-12 px-4">
      <Tabs defaultValue="stats" className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Личный кабинет</h2>
            <p className="text-muted-foreground">Управление и аналитика</p>
          </div>
          <div className="flex items-center gap-4">
            <Label htmlFor="role-switch" className="text-sm">Роль:</Label>
            <div className="flex gap-2">
              <Button 
                variant={userRole === 'advertiser' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setUserRole('advertiser')}
              >
                Рекламодатель
              </Button>
              <Button 
                variant={userRole === 'webmaster' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setUserRole('webmaster')}
              >
                Вебмастер
              </Button>
              <Button 
                variant={userRole === 'admin' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setUserRole('admin')}
              >
                Админ
              </Button>
            </div>
          </div>
        </div>

        <TabsList className="grid w-full max-w-md grid-cols-3">
          <TabsTrigger value="stats">Статистика</TabsTrigger>
          <TabsTrigger value="offers">Мои офферы</TabsTrigger>
          <TabsTrigger value="settings">Настройки</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: 'MousePointer', label: 'Всего кликов', value: statsData.totalClicks.toLocaleString(), color: 'text-blue-500' },
              { icon: 'CheckCircle', label: 'Конверсий', value: statsData.totalConversions.toLocaleString(), color: 'text-green-500' },
              { icon: 'DollarSign', label: userRole === 'webmaster' ? 'Заработано' : 'Выплачено', value: `${statsData.totalEarnings.toLocaleString()}₽`, color: 'text-primary' },
              { icon: 'Briefcase', label: 'Активных офферов', value: statsData.activeOffers.toString(), color: 'text-accent' }
            ].map((stat, idx) => (
              <Card key={idx} className="hover:shadow-lg transition-shadow animate-slide-up" style={{ animationDelay: `${idx * 0.05}s` }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Icon name={stat.icon as any} size={18} className={stat.color} />
                    {stat.label}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>График конверсий</CardTitle>
              <CardDescription>Динамика за последние 30 дней</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end justify-between gap-2 px-4">
                {[45, 67, 52, 89, 73, 91, 68, 78, 95, 102, 87, 94, 110, 98].map((value, idx) => (
                  <div key={idx} className="flex-1 bg-gradient-to-t from-primary to-accent rounded-t-lg hover:opacity-80 transition-opacity cursor-pointer animate-slide-up" style={{ height: `${value}%`, animationDelay: `${idx * 0.05}s` }} title={`День ${idx + 1}: ${value} конверсий`} />
                ))}
              </div>
              <div className="flex justify-between mt-4 text-xs text-muted-foreground px-4">
                <span>1 дек</span>
                <span>14 дек</span>
                <span>30 дек</span>
              </div>
            </CardContent>
          </Card>

          {userRole === 'admin' && (
            <Card>
              <CardHeader>
                <CardTitle>Топ вебмастеров</CardTitle>
                <CardDescription>По количеству конверсий за месяц</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'webmaster_1337', conversions: 342, earnings: 856000 },
                    { name: 'pro_marketer', conversions: 298, earnings: 745000 },
                    { name: 'traffic_king', conversions: 267, earnings: 667500 }
                  ].map((wm, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-bold text-primary">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-medium">{wm.name}</div>
                          <div className="text-sm text-muted-foreground">{wm.conversions} конверсий</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-primary">{wm.earnings.toLocaleString()}₽</div>
                        <div className="text-sm text-muted-foreground">выплачено</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          {userRole === 'advertiser' && (
            <Card>
              <CardHeader>
                <CardTitle>Добавить новый оффер</CardTitle>
                <CardDescription>Разместите пиксель на странице благодарности и активируйте оффер</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="offer-name">Название оффера</Label>
                  <Input id="offer-name" placeholder="Название вашего продукта или услуги" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="offer-desc">Описание</Label>
                  <Textarea id="offer-desc" placeholder="Краткое описание оффера" rows={3} />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offer-payout">Ставка за лид (₽)</Label>
                    <Input id="offer-payout" type="number" placeholder="Минимум 500" min={500} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="offer-category">Категория</Label>
                    <Input id="offer-category" placeholder="Например: Образование" />
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-muted space-y-3">
                  <Label className="text-sm font-medium">Код пикселя для размещения</Label>
                  <code className="block p-3 bg-background rounded text-sm font-mono overflow-x-auto">
                    {`<script src="https://cpasibo.pro/pixel.js" data-offer-id="YOUR_OFFER_ID"></script>`}
                  </code>
                  <p className="text-sm text-muted-foreground">
                    Разместите этот код на странице "Спасибо за заявку"
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <div className="space-y-1">
                    <div className="font-medium">Предоплата активации</div>
                    <div className="text-sm text-muted-foreground">
                      x20 от ставки за лид (минимум 10,000₽)
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-4 py-2">10,000₽</Badge>
                </div>

                <Button className="w-full" size="lg" onClick={() => toast.success('Оффер отправлен на модерацию!')}>
                  <Icon name="Send" size={20} className="mr-2" />
                  Отправить на модерацию
                </Button>
              </CardContent>
            </Card>
          )}

          {userRole === 'webmaster' && (
            <div className="space-y-4">
              {mockOffers.filter(o => o.status === 'active').map((offer) => (
                <Card key={offer.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{offer.name}</CardTitle>
                        <CardDescription>{offer.description}</CardDescription>
                      </div>
                      <Badge className="text-lg px-4 py-2">{offer.payout.toLocaleString()}₽</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-muted">
                        <Label className="text-xs text-muted-foreground mb-2 block">Ваша партнерская ссылка</Label>
                        <div className="flex gap-2">
                          <Input 
                            readOnly 
                            value={`${offer.name.toLowerCase().replace(/\s+/g, '')}.ru/?utm_source=cpasibo_pro&utm_medium=cpl&wm_id=1`}
                            className="font-mono text-sm"
                          />
                          <Button variant="outline" size="icon" onClick={() => toast.success('Ссылка скопирована!')}>
                            <Icon name="Copy" size={18} />
                          </Button>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="p-3 rounded-lg bg-blue-500/10">
                          <div className="text-2xl font-bold text-blue-500">234</div>
                          <div className="text-xs text-muted-foreground">Кликов</div>
                        </div>
                        <div className="p-3 rounded-lg bg-green-500/10">
                          <div className="text-2xl font-bold text-green-500">12</div>
                          <div className="text-xs text-muted-foreground">Лидов</div>
                        </div>
                        <div className="p-3 rounded-lg bg-primary/10">
                          <div className="text-2xl font-bold text-primary">{(offer.payout * 12).toLocaleString()}₽</div>
                          <div className="text-xs text-muted-foreground">Заработано</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Настройки аккаунта</CardTitle>
              <CardDescription>Управление профилем и уведомлениями</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input type="email" placeholder="your@email.com" />
                </div>
                
                <div className="space-y-2">
                  <Label>Telegram для уведомлений</Label>
                  <Input placeholder="@username" />
                </div>
              </div>

              <div className="space-y-4 pt-6 border-t">
                <h4 className="font-medium">Уведомления</h4>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Новые конверсии</Label>
                    <p className="text-sm text-muted-foreground">Получать уведомления о новых лидах</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Еженедельный отчет</Label>
                    <p className="text-sm text-muted-foreground">Статистика за неделю на email</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Новые офферы</Label>
                    <p className="text-sm text-muted-foreground">Уведомления о новых офферах в каталоге</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>

              <Button className="w-full">Сохранить изменения</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderFAQ = () => (
    <div className="container mx-auto max-w-4xl py-12 px-4">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-3">Часто задаваемые вопросы</h2>
        <p className="text-muted-foreground">Всё, что нужно знать о работе платформы</p>
      </div>

      <div className="space-y-4">
        {[
          {
            q: 'Как начать работу на платформе?',
            a: 'Зарегистрируйтесь, выберите роль (рекламодатель или вебмастер), и следуйте инструкциям в личном кабинете.'
          },
          {
            q: 'Какая минимальная ставка за лид?',
            a: 'Минимальная ставка составляет 500 рублей. Платформа берёт комиссию 20% с каждого лида.'
          },
          {
            q: 'Как работает система отслеживания?',
            a: 'Разместите наш пиксель на странице благодарности. Система автоматически отследит все конверсии и покажет их в статистике.'
          },
          {
            q: 'Когда происходят выплаты?',
            a: 'Выплаты происходят еженедельно при достижении минимального порога в 5000 рублей.'
          }
        ].map((faq, idx) => (
          <Card key={idx} className="hover:shadow-md transition-shadow animate-slide-up" style={{ animationDelay: `${idx * 0.1}s` }}>
            <CardHeader>
              <CardTitle className="text-lg flex items-start gap-3">
                <Icon name="HelpCircle" size={24} className="text-primary mt-1 flex-shrink-0" />
                {faq.q}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground pl-9">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderFooter = () => (
    <footer className="border-t bg-muted/30 mt-20">
      <div className="container mx-auto max-w-6xl py-12 px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-xl">CPAsibo Pro</h3>
            <p className="text-sm text-muted-foreground">
              Платформа нового поколения для эффективной партнёрской работы
            </p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Продукт</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="hover:text-primary cursor-pointer transition-colors">Офферы</div>
              <div className="hover:text-primary cursor-pointer transition-colors">Документация</div>
              <div className="hover:text-primary cursor-pointer transition-colors">API</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Поддержка</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="hover:text-primary cursor-pointer transition-colors">FAQ</div>
              <div className="hover:text-primary cursor-pointer transition-colors">Контакты</div>
              <div className="hover:text-primary cursor-pointer transition-colors">Telegram</div>
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-4">Контакты</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Icon name="Mail" size={16} className="text-muted-foreground" />
                <span>support@cpasibo.pro</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Icon name="MessageCircle" size={16} className="text-muted-foreground" />
                <span>@cpasibo_support</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          © 2024 CPAsibo Pro. Все права защищены.
        </div>
      </div>
    </footer>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Icon name="TrendingUp" size={24} className="text-white" />
            </div>
            <span className="font-bold text-xl">CPAsibo Pro</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => setSelectedTab('home')}>Главная</Button>
            <Button variant="ghost" onClick={() => setSelectedTab('offers')}>Офферы</Button>
            <Button variant="ghost" onClick={() => setSelectedTab('cabinet')}>Кабинет</Button>
            <Button variant="ghost" onClick={() => setSelectedTab('faq')}>FAQ</Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
            <Button>
              <Icon name="User" size={18} className="mr-2" />
              Войти
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {selectedTab === 'home' && renderHero()}
        {selectedTab === 'offers' && renderOffers()}
        {selectedTab === 'cabinet' && renderCabinet()}
        {selectedTab === 'faq' && renderFAQ()}
      </main>

      {renderFooter()}
    </div>
  );
};

export default Index;
