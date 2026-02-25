def Delit(x):
    a = []
    for i in range(2, int(x**0.5)+1):
        if x % i == 0:
            a.append(i)
            if x//i != x: 
                a.append(x//i)
    return sorted(set(a))
k = 0
for i in range(100,3001):
    if (len(Delit(i))> 0):
        if max(Delit(i)) % 10 == 3:
            k +=1
print(k)