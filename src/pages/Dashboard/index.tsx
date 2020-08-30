import React, { useState, useCallback, useEffect, useMemo } from 'react';
import DayPicker, { DayModifiers } from 'react-day-picker';
import { isToday, format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';
import 'react-day-picker/lib/style.css';

import { FiPower, FiClock } from 'react-icons/fi';

import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointment,
  Section,
  Appointment,
  Calendar,
} from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface Appointment {
  id: string;
  date: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);

  const { signOut, user } = useAuth();

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  // month availability
  useEffect(() => {
    api
      .get(`/providers/${user.id}/month-availability`, {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        },
      })
      .then((response) => {
        setMonthAvailability(response.data);
      });
  }, [currentMonth, user.id]);

  // today appointments
  useEffect(() => {
    api
      .get('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then((response) => {
        setAppointments(response.data);
        console.log(response.data);
      });
  }, [selectedDate]);

  const disabledDays = useMemo(() => {
    const dates = monthAvailability
      .filter((monthDay) => monthDay.available === false)
      .map((monthDay) => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });
    return dates;
  }, [currentMonth, monthAvailability]);

  const selectedDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", {
      locale: ptBR,
    });
  }, [selectedDate]);

  const selectedWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', {
      locale: ptBR,
    });
  }, [selectedDate]);

  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarber" />
          <Profile>
            <img src={user.avatar_url} alt={user.name} />
            <div>
              <span>Bem-vindo, </span>
              <strong>{user.name}</strong>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>

      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          <NextAppointment>
            <strong>Atendimento a seguir</strong>
            <div>
              <img
                src="data:image/jpeg;base64,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"
                alt="Eduardo Leal"
              />

              <strong>Eduardo Leal</strong>
              <span>
                <FiClock />
                08:00
              </span>
            </div>
          </NextAppointment>

          <Section>
            <strong>Manhã</strong>

            <Appointment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="data:image/jpeg;base64,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"
                  alt="Eduardo Leal"
                />

                <strong>Eduardo Leal</strong>
              </div>
            </Appointment>
            <Appointment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAwICRINDRERERENERINFRIVEA0NEBkOEBAWIBoiISsaKh0lKjkvJSc1KB0eMEYxNUdKQUJBIy5JT0g/TjlAQT4BDQ4OExETIhUVIj4xKy0+Pz5FRUU+SEVCPkFFQj5DPj5FPkI+Pkg+Sj5IPz4/Pj8/Pj4+Pj4+Pj4+Pj4+Pj4+Pv/AABEIAMgAyAMBIgACEQEDEQH/xAAbAAACAwEBAQAAAAAAAAAAAAAAAQIEBQMGB//EADwQAAIBAwIDBgQEBAMJAAAAAAABAgMEERIhBTFBBhNRYXGBIjKRoSNCsdEUUsHhM2LwBxUWJCVTY3Lx/8QAGgEAAgMBAQAAAAAAAAAAAAAAAAECAwQFBv/EACkRAAICAQQBBAIBBQAAAAAAAAABAhEDBBIhMVETIkFhMoGhBRQjQlL/2gAMAwEAAhEDEQA/APKoP9ewYGkd85YYAfUMAAAAwAWAHgBgMT28AbwZt9fYzGD38eZXOcYK2TjFydItVriFPm16cypW4kl8iz5vYzpScnltvze5E589XL/U1Rwpdlt8QqPqhx4jNP8AL9MFMCr+4y/9E/Th4NSHEYvmmuXmWoVYyWzRgkoycXlN+xdDWSX5IrlgXwb7EylaXmpqMufj4lzJvhNTVozOLi6YmJkmRJiEANCEMTEyTQiIyOAGAAWx4AMlhWAA2LIgJDI6hJjAk2JsGypxC47uGOsuRGUlFWxpNukVuI3mXoi+XNoz2DeSxQsalWDnGLaX3OJmyuct0jowhSpFYCU6bi8NNNdHsEY5IEqIgTjTcs46CccCsKZEB4FgYDTwXrW95Rl9SgBbjyyxu0QlBSVM3tWURbKlpX1Rw+h31HWhNSVoxuNOjo2LYi5C1EmxE2Ii2GojYDYCyAAWwYCLCCGLIEciGSyLUJsWRAPVuZF/PVVflsarMe5X4svNmXVt7KL8K9xb4Tw/+Ill50r7nrbKzjSgopcinwC30UltzNumtzzuWbk6O1hgox+zlLhlKqvjpwfm0sguBW2lx7qG+dkX4rCJLKWSi2i2jGj2dowb0JrxzuVrvs7TknjKfij0Sl8LeDhMlul3YKKqqPJ0+z06csrRNb7T2J1uzqlHOcS8j02MLkcar8iTyS7sj6caqjyUuAtP5tjIr0nSm4voe7qLJ5jj1HDUse5fiytyplGXElG0ZltLTL1L2TNhzRoI7Oml7aOZlXNksjyQyGTVZTRNMMkUPICJJgICQF5iyNkS0gJhkGJsixoGxAwEMRmSh3lzp8ZJGmytwiGu+9NTMesdQ/Zo06uVHsLGmoRS8EvIuQlHy9jGvKtRYhTTy+bRRq1bmEcJM4Hp3ydjdR7GnNM6uKaPAS4td0ktnhdUjb4Jx6VZ6Zrl6knhVdiWU9J3ezIOmhU7nVnb/wCFe8vY0ivYWbkTnTXiVKkcPmY172lUZNKLePYqf8Qymt4e5JYWQ9VG7PZGDxmGqlLyH/vffLT0v7EruWunJ9GmOMHF2LcpI8vD5l7GgmUqS+JF07Wm/FnJy9jYhgaikCSIZJJjQgGRAYUaLIjZFl5WIQxCGgYmDAQydOjKo8RTb8g7OUf+YqtreG2/qXOELVVaT6Z+5asaWm8ulhfPHl6HH1uV7nj8KzpaTEqWT7otT+DMvtzKM6qllzelLonpNG5pak8N+25jVOEpqeW3KWMOe+n0OZFpvlnR5S4JVJ0ZbQe/lJMLRxVRbLnzWxXt7Lu6kpVZKplPCaUcN9S3RoYXrjGcjkorpijuf5Kj0tKCcM+nmYHGaiTab5ZNu1lilg89xOnqrSz0zhFakScaRm07NVZZwvV7lxWqgvyvyaCnRzSmnKSk09GnGE/PqUKdvX1vM3HGdoS1ZfuXpWuyp+11tNKKp1I40pY6bIg6WmDj0WTjaQq6nqSz4rYvzj8LIXToKvk8nRj+I/LJaR1s6C0zqST3k4xxtjzOZ2dLJOLXg5eeDTTfyGRi6DNZnESREkgECAAGBeYmNiZeysQh5EIYmDGAhml2fliu00mnF5b6Y3NBtO4qTSx3jX2WDK4PUUa2JZXeJxyt8M16lPu5003nCxnlnc4WvX+frtHX0bTxfst01zyKdBP8vPwJ01ud3Hbdr0OdTOjFGd/B0/5HnzH3Si3sti3OrCK6FeD1zxjZ9RP7G6R3o08QbZlXFNSqNs9BGniDRj31LS8r3RHkjZW/g9X7ocbLf5n9izb1FLCL0KOVlbkk2BnK1jCLx9Sld7Rfua1zHCe2DIvSUVyQl0UqUYrh+F8yy5e7Mo06q029Twk0o52zuZiOzoeYSf2cvWJKUUvAxAxm0xANCBAAwACQi8xNjIsvKwENiEMQANIQydCWmcZfytM9LXuKdanGcZLUsbcmeYR1hLTKL8zJqdN61O+UaMGoeK1VpnpIVXsOdRvr4kKa1RXsSbwjzzs70WRjTct30OVxeSpOKjFPnu3g6Sq4WELu9T5f1CuROSZZocWzST267PCeTJuOJSnWfw6lnnlI73FpqfJryWVk4VLfSuX02HXkQ4N5ykvY0KFzJLGTLpz0vHiWY1NkvuRpoe5NFqtWzz57mZXWucY+LO9SXJGbfXDpNOOMvO/gW4ouctseyrLNRVs48al+Kop7RXLPJmciU5OTbby31ZFHew4/Tgo+DjZZ75uQCGwLCoQ0CGkAAIYEhF5kWyQmXECIDEIYDSENMAGkNPKFkMgB6DhtXvKK33jsdmst+ZkcKr6J6eSma+Tzerx+nla/Z3dNP1MaZQr16lvP4oaqcuVRZ2fmXbO4nUXwKl7tvqdKiUo4aK1OgoyzvF/zRZnTVU0aFFvp/wAF+rSrt/LSez+JTwkULtVaabk6OE8YWXnzyXFNKOHUW/jFlK6pKfObkljEOSQ/ZYVlfgyqnEG5d3Cnql0cN4fU0qdKSitWMtdOhyo26jLOPp0OtSeBN+EJxa7ZzS39DG4jU1VWvDCNavV7um2YE5Zbfib9BjuTn44MGsn7VHyRbEDEjrnNGxBkaABIkhIAAAGmAAXyLRIiy8qExDyIRJAH+kAgAlkExAmAHe23qR58+huU3th9OpXsIK0s3dSS13ElRt0/B7OX9C24bZRw/wCozUppL4Orok4xb8nWLytiMo/c5UquHz/sXaDjLm0c86CkUJ0qnQj3Ul4/qbDpwK9WmlvkTGZ0/hRWlLL9DveVUttv1K8I5CiuT5OF7SlVpycX/hYlKHXT4+xjNm/ZP/qtvT6VFJTXRrqjN43YOzu6lLonmDa5xfI7Gimtm05mqXuso5FkjkSZuMtE2wIZGmFiJpghZFkYE8iDIAIvZ9R5I5DJdZCgayJjLNnw+tcySpU5z80sJe4m6GVQjFtr9OZ6/hvYpyw69XH/AI6X7npLDgVvbY0Uoal+ZrVP6maephHrksWKTPB2XZq7uI6lT7uL/NVenPtzNmy7E6t6tVvyhHT92e5lTjCO/wBFudbWGpxeNuZllqZvrguWGKPnX+0G3VnLhtvBNQhHZc/zLLOtOOYov/7WLXLsqyXyOcG/XDX6FHh710ovyRy87uVnSwfiVbihvlcyq6lSL5PbwNevT8jgoJlSdFziUVxCXVM51r1y5ZL87ZPwOEqCXQLXgKZShGU3v1LtO3widKluW3HSgbsSVGdwqjr45b/5KdR/0/qes45wqFdRcoxe2N4qRidjqHfcSrV8f4cYwi/V5f6I9vd0tUTZj4gjFm5kz57d9kITWYNwl4LeH0Me+7KXdutSiqsVnek8tex9Eqy0OOVzeDtUScMo0xzzXDM7gvg+NTi4tppprOzTTRA+n8T7P0L2OqUUp/8AchiL/ueU4h2Qr0m3Saqpfl+WZojnjIrcGjzuoFInXt50paZwnBrO004nIu3EKJ6gIZAlvFRo4bNThfAq9404R0w2/FnmK/ubPZ3s1lRrXEX4wovK93+x7ClT04SSSXRbJFWXUqPEeWShi3csxOG9krejh1Pxp7fNtBex6GnZKEcQUEv5UsIenY628sbGCWSUnyzTGCXRwhrjnbHmFNvPMuXFPMWyvSp5iytkqOsI95z6YNC2hg4W9LTFee5cpLCJEWef7d2H8Vw+aSzKnmcfVbng+DVsLSfU+Ix1Qwz5bWtv4a8q0+kZPT/6vdGbMa8D+DYlHVEqVKRZt56okpRTM/Rosz3NpYwc9Dk8l6VISpjCzjRpHHiFXTFouNqKMu+erZeYAj0nYS10WzqNb15yl6pbL9D1lWGUzN4Fb9zQoU8fJCP1watWWH1N/So583cmzEuqO7RVqrEfXBrXccrJm1Y5aXmJ9EF2TpwxFBKh1O2MRDGUFjozbrhlO5TjUpxkv8255jinYpNOVtNp7/hT5P0Z7lLDOVWOWTjOUehOKZ8du7OpbzcKsJQkukk1kD6hxThtK8pOFSKfg1s16MDQtQq5KnjZv0qKSCdPDTO8UCWcoys0HPwQNaZBF/FnwO845X0IgTjusHKjHdx8zrTWCVOPxN+AxFhYis+HsZd52hp0W404uq1zaemC9ypxS9nXk6NNtQW0mttX9jjbcPSW6JVYi9R4nK6WJ01Dwabe557tDZN1Y1op8sTa39GehpUdPL9hVKed2vVeK8SGSFonCW12eOo7FuLyal7wXLc6K3f5OSfoZml05aZpxa6S2MbTXZshJS6BrGxxqbFppNHGqs7LdvkluFEyhVlk0uF8Dc8VK3LZxg/6mvwngsaaVSqlKfPD3UTUqJRj4efkaIYq5ZmyZfiJR4lJxt1GLacuqynhHnoqvGWY1aq9Jtm3cT72Xl0QQt1jkXmcp23E6iko1nqT/NhKaL7XxJ/crVLTfkWaa+GPlsOS4IrsnzRKK2HFHTGEQSJHLBCUdjrFBJDAqTiBOvsvUBAaT+FteAU3lvyTACT7GRhHdneIwIoCZCqnoaXOXUAGhFehZKHTfxOzpJP9gAmIkqaI1aWVj78gAQBbrGNTSx47EOJ2NO5p42ys6ZrGUAEGlbQ032eMunO1qunPpyfRo3eC2GrFWa3fyp9F4gBTCC3P6NE5txX2bk3CMcOSXkULufeYSyks7+IAaEZjlCjg7RpoYDAI01uyEqaT29QAGwJ4wD5AAhnKL3GwAXwIq3EvjS8AABjP/9k="
                  alt="Eduardo Leal"
                />

                <strong>Eduardo Leal</strong>
              </div>
            </Appointment>
          </Section>

          <Section>
            <strong>Tarde</strong>
            <Appointment>
              <span>
                <FiClock />
                08:00
              </span>

              <div>
                <img
                  src="data:image/jpeg;base64,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"
                  alt="Eduardo Leal"
                />

                <strong>Eduardo Leal</strong>
              </div>
            </Appointment>
          </Section>
        </Schedule>
        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disabledDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onDayClick={handleDateChange}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
